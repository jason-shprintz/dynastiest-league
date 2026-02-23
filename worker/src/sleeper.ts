/**
 * Sleeper API Client
 * Functions to fetch data from Sleeper API
 */

import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  SleeperNflState,
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
 * Fetch NFL state from Sleeper to get current week
 */
export async function fetchNflState(): Promise<SleeperNflState> {
  const response = await fetch(`${SLEEPER_API_BASE}/state/nfl`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NFL state: ${response.statusText}`);
  }
  return response.json();
}

const PLAYERS_KV_KEY = 'sleeper_players';
const PLAYERS_TTL_SECONDS = 86400; // 24 hours

/**
 * Fetch player names for specific player IDs, using KV as a daily cache.
 * Returns a map of playerId -> { name, position }
 */
export async function fetchPlayerNames(
  playerIds: string[],
  kv: KVNamespace,
): Promise<Record<string, { name: string; position: string }>> {
  if (playerIds.length === 0) return {};

  let playerMap: Record<string, { name: string; position: string }> = {};

  // Try KV cache first
  const cached = await kv.get(PLAYERS_KV_KEY, 'json');
  if (cached) {
    playerMap = cached as Record<string, { name: string; position: string }>;
  } else {
    // Fetch all players from Sleeper and store slim version in KV
    try {
      const response = await fetch('https://api.sleeper.app/v1/players/nfl');
      if (response.ok) {
        const allPlayers = (await response.json()) as Record<
          string,
          { full_name?: string; position?: string }
        >;
        // Only store id -> { name, position } to keep KV entry small
        for (const [id, p] of Object.entries(allPlayers)) {
          if (p.full_name) {
            playerMap[id] = {
              name: p.full_name,
              position: p.position ?? '?',
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
  }

  // Return only the requested players
  const result: Record<string, { name: string; position: string }> = {};
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
