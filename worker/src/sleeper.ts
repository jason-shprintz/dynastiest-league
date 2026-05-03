/**
 * Sleeper API Client
 * Functions to fetch data from Sleeper API
 */

import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  SleeperNflState,
  SleeperLeague,
  PlayerInfo,
} from './types';

const SLEEPER_API_BASE = 'https://api.sleeper.app/v1';

/**
 * Fetch transactions for a specific week
 */
export async function fetchTransactions(
  leagueId: string,
  week: number,
): Promise<SleeperTransaction[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/transactions/${week}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all rosters for a league
 */
export async function fetchRosters(leagueId: string): Promise<SleeperRoster[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/rosters`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch rosters: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all users in a league
 */
export async function fetchUsers(leagueId: string): Promise<SleeperUser[]> {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch the league object (includes previous_league_id, etc.)
 */
export async function fetchLeague(leagueId: string): Promise<SleeperLeague> {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch NFL state from Sleeper to get current week
 */
export async function fetchNflState(): Promise<SleeperNflState> {
  const response = await fetch(`${SLEEPER_API_BASE}/state/nfl`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL state: ${response.statusText}`);
  }
  return response.json();
}

// KV cache key — v2 stores enriched player info (team, age, years_exp, search_rank)
const PLAYERS_KV_KEY = 'sleeper_players_v2';
const PLAYERS_TTL_SECONDS = 86400; // 24 hours

/**
 * Fetch (or return cached) the full enriched player map from Sleeper.
 * Stores PlayerInfo records in KV so the bandwidth cost is paid at most once per day.
 */
export async function getPlayerMap(
  kv: KVNamespace,
): Promise<Record<string, PlayerInfo>> {
  // Try KV cache first
  const cached = await kv.get(PLAYERS_KV_KEY, 'json');
  if (cached) {
    return cached as Record<string, PlayerInfo>;
  }

  // Fetch all players from Sleeper and store enriched version in KV
  const playerMap: Record<string, PlayerInfo> = {};
  try {
    const response = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (response.ok) {
      const allPlayers = (await response.json()) as Record<
        string,
        {
          full_name?: string;
          position?: string;
          team?: string;
          age?: number;
          years_exp?: number;
          search_rank?: number;
        }
      >;
      for (const [id, p] of Object.entries(allPlayers)) {
        if (p.full_name) {
          playerMap[id] = {
            name: p.full_name,
            position: p.position ?? '?',
            team: p.team ?? undefined,
            age: p.age ?? undefined,
            years_exp: p.years_exp ?? undefined,
            search_rank: p.search_rank ?? undefined,
          };
        }
      }
      await kv.put(PLAYERS_KV_KEY, JSON.stringify(playerMap), {
        expirationTtl: PLAYERS_TTL_SECONDS,
      });
    }
  } catch (err) {
    console.error('Failed to fetch /players/nfl:', err);
  }

  return playerMap;
}

/**
 * Fetch enriched player info for specific player IDs, using KV as a daily cache.
 * Returns a map of playerId -> PlayerInfo
 */
export async function fetchPlayerNames(
  playerIds: string[],
  kv: KVNamespace,
): Promise<Record<string, PlayerInfo>> {
  if (playerIds.length === 0) return {};

  const playerMap = await getPlayerMap(kv);

  // Return only the requested players
  const result: Record<string, PlayerInfo> = {};
  for (const id of playerIds) {
    if (playerMap[id]) result[id] = playerMap[id];
  }
  return result;
}

/**
 * Get the current NFL week from Sleeper API
 */
export async function getCurrentWeek(): Promise<number> {
  try {
    const state = await fetchNflState();
    return state.week || 1;
  } catch (error) {
    console.error(
      'Failed to fetch current week from Sleeper, defaulting to week 1:',
      error,
    );
    return 1;
  }
}
