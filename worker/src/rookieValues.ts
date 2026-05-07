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

const FANTASYCALC_URL =
  'https://api.fantasycalc.com/values/current?isDynasty=true&numQbs=1&numTeams=10&ppr=1';

const KV_KEY = 'fantasycalc_dynasty_v1';
const TTL_SECONDS = 86400; // 24 hours — values shift slowly

export interface RookieValue {
  /** FantasyCalc dynasty value (roughly 0–10000 scale) */
  value: number;
  /** Overall rank across all dynasty assets (lower = more valuable) */
  overallRank: number;
  /** Rank within the player's position — omitted when not present in API response */
  positionRank?: number;
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

/**
 * Fetch (or return cached) the dynasty value map from FantasyCalc.
 * Returns an empty map on any error so callers can degrade gracefully.
 */
export async function getRookieValueMap(kv: KVNamespace): Promise<RookieValueMap> {
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

    for (const entry of entries) {
      const player = entry.player;
      if (!player) continue;
      if (entry.value === undefined || entry.overallRank === undefined) continue;

      const v: RookieValue = {
        value: entry.value,
        overallRank: entry.overallRank,
        ...(entry.positionRank !== undefined && { positionRank: entry.positionRank }),
      };

      if (player.position === 'PICK') {
        const parsed = player.name ? parsePickName(player.name) : null;
        if (parsed) {
          map.picks[`${parsed.season}:${parsed.round}`] = v;
        }
        continue;
      }

      if (player.sleeperId) {
        map.players[player.sleeperId] = v;
      }
    }

    try {
      await kv.put(KV_KEY, JSON.stringify(map), { expirationTtl: TTL_SECONDS });
    } catch (err) {
      console.error('Failed to write rookie values to KV:', err);
    }

    console.log(
      `FantasyCalc loaded: ${Object.keys(map.players).length} players, ${Object.keys(map.picks).length} picks`,
    );
    return map;
  } catch (err) {
    console.error('Failed to fetch FantasyCalc values:', err);
    return EMPTY_MAP;
  }
}
