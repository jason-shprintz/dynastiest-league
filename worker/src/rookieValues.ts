/**
 * Dynasty Rookie Values from FantasyCalc
 *
 * Fetches dynasty values for players (and rookie picks) from FantasyCalc's
 * public API. Sleeper player IDs are native to the response, so no fuzzy
 * matching is required. Values are cached in KV with a 24-hour TTL.
 *
 * League format params are currently hardcoded for this league (10-team,
 * 1QB, full PPR). When the league config evolves, these should be sourced
 * from fetchLeague() — see issue #59 for the full integration spec.
 */

import type { PlayerInfo } from './types';
import type { SleeperNflState } from './types';

const FANTASYCALC_URL =
  'https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1';

// Bumped from v2 → v3: rookie identity now uses nflState.season + player.metadata.draft_year.
const KV_KEY = 'fantasycalc_dynasty_v3';
const TTL_SECONDS = 86400; // 24 hours — values shift slowly

export interface RookieValue {
  /** FantasyCalc dynasty value (roughly 0–10000 scale) */
  value: number;
  /** Rank within the player's position across all dynasty assets. */
  positionRank?: number;
  /**
   * Rank among ROOKIES ONLY in this class. 1 = best rookie.
   * This is the authoritative
   * rank for rookie-draft slot evaluation — overallRank is misleading
   * because it counts veterans ahead of rookies.
   */
  rookieRank?: number;
  /**
   * Rank among rookies of the same position (e.g. "WR2 of this rookie class").
   */
  rookiePositionRank?: number;
}

export interface RookieValueMap {
  /** Keyed by Sleeper player ID */
  players: Record<string, RookieValue>;
  /** Keyed by `${season}:${round}` for rookie picks (e.g. "2026:1") */
  picks: Record<string, RookieValue>;
}

interface FantasyCalcEntry {
  player?: {
    sleeperId?: string | null;
    name?: string;
    position?: string;
  };
  value?: number;
  overallRank?: number;
  positionRank?: number;
}

const EMPTY_MAP: RookieValueMap = { players: {}, picks: {} };

/**
 * Parse a FantasyCalc pick name into {season, round}.
 * Examples: "2026 1st" → {2026, 1}, "2027 Mid 2nd" → {2027, 2}.
 * Returns null if the format isn't recognized.
 */
function parsePickName(name: string): { season: string; round: number } | null {
  const match = name.match(/^(\d{4}).*?(\d)(?:st|nd|rd|th)/i);
  if (!match) return null;
  const round = parseInt(match[2], 10);
  if (!Number.isFinite(round)) return null;
  return { season: match[1], round };
}

function isCurrentSeasonRookie(
  playerInfo: PlayerInfo | undefined,
  season: string,
): boolean {
  if (!playerInfo?.draft_year) return false;
  const draftYear = parseInt(playerInfo.draft_year, 10);
  const currentSeason = parseInt(season, 10);
  if (!Number.isFinite(draftYear) || !Number.isFinite(currentSeason)) return false;
  return currentSeason - draftYear === 0;
}

/**
 * Fetch (or return cached) the dynasty value map from FantasyCalc.
 * Returns an empty map on any error so callers can degrade gracefully.
 */
export async function getRookieValueMap(
  kv: KVNamespace,
  playerMap: Record<string, PlayerInfo>,
  nflState: SleeperNflState,
): Promise<RookieValueMap> {
  try {
    const cached = await kv.get(KV_KEY, 'json');
    if (cached) {
      return cached as RookieValueMap;
    }
  } catch (err) {
    console.error('Failed to read rookie values from KV:', err);
  }

  try {
    const response = await fetch(FANTASYCALC_URL);
    if (!response.ok) {
      console.error(
        `FantasyCalc fetch failed: ${response.status} ${response.statusText}`,
      );
      return EMPTY_MAP;
    }
    const entries = (await response.json()) as FantasyCalcEntry[];
    const map: RookieValueMap = { players: {}, picks: {} };
    const rookieEntries: Array<{
      sleeperId: string;
      position: string;
      value: number;
      overallRank: number;
      positionRank?: number;
    }> = [];

    for (const entry of entries) {
      const player = entry.player;
      if (!player) continue;
      if (entry.value === undefined || entry.overallRank === undefined) continue;

      if (player.position === 'PICK') {
        const v: RookieValue = {
          value: entry.value,
          ...(entry.positionRank !== undefined && { positionRank: entry.positionRank }),
        };
        const parsed = player.name ? parsePickName(player.name) : null;
        if (parsed) {
          map.picks[`${parsed.season}:${parsed.round}`] = v;
        }
        continue;
      }

      if (player.sleeperId && isCurrentSeasonRookie(playerMap[player.sleeperId], nflState.season)) {
        rookieEntries.push({
          sleeperId: player.sleeperId,
          position: playerMap[player.sleeperId]?.position ?? player.position ?? 'UNK',
          value: entry.value,
          overallRank: entry.overallRank,
          ...(entry.positionRank !== undefined && { positionRank: entry.positionRank }),
        });
      }
    }

    rookieEntries.sort((a, b) => a.overallRank - b.overallRank);
    const positionCounters: Record<string, number> = {};
    rookieEntries.forEach((entry, idx) => {
      positionCounters[entry.position] = (positionCounters[entry.position] ?? 0) + 1;
      map.players[entry.sleeperId] = {
        value: entry.value,
        rookieRank: idx + 1,
        rookiePositionRank: positionCounters[entry.position],
        ...(entry.positionRank !== undefined && { positionRank: entry.positionRank }),
      };
    });

    if (Object.keys(map.players).length === 0) {
      console.warn(
        `Rookies identified by draft_year: 0 (season=${nflState.season}). Check Sleeper draft_year metadata and FantasyCalc payload.`,
      );
    }

    try {
      await kv.put(KV_KEY, JSON.stringify(map), { expirationTtl: TTL_SECONDS });
    } catch (err) {
      console.error('Failed to write rookie values to KV:', err);
    }

    console.log(
      `FantasyCalc loaded: ${Object.keys(map.players).length} rookies, ${Object.keys(map.picks).length} picks`,
    );
    return map;
  } catch (err) {
    console.error('Failed to fetch FantasyCalc values:', err);
    return EMPTY_MAP;
  }
}
