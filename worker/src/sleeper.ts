/**
 * Sleeper API Client
 * Functions to fetch data from Sleeper API
 */

import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  SleeperNflState,
} from "./types";

const SLEEPER_API_BASE = "https://api.sleeper.app/v1";

/**
 * Fetch transactions for a specific week
 */
export async function fetchTransactions(
  leagueId: string,
  week: number
): Promise<SleeperTransaction[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/transactions/${week}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all rosters for a league
 */
export async function fetchRosters(
  leagueId: string
): Promise<SleeperRoster[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/rosters`
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

/**
 * Get the current NFL week from Sleeper API
 */
export async function getCurrentWeek(): Promise<number> {
  try {
    const state = await fetchNflState();
    return state.week || 1;
  } catch (error) {
    console.error("Failed to fetch current week from Sleeper, defaulting to week 1:", error);
    return 1;
  }
}
