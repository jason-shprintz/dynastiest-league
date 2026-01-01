/**
 * Sleeper API Client
 * Functions to fetch data from Sleeper API
 */

import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  SleeperPlayer,
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
 * Fetch all NFL players
 */
export async function fetchPlayers(): Promise<Record<string, SleeperPlayer>> {
  const response = await fetch(`${SLEEPER_API_BASE}/players/nfl`);
  if (!response.ok) {
    throw new Error(`Failed to fetch players: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get the current NFL week
 * This is a simplified version - you may want to adjust based on the current season state
 */
export function getCurrentWeek(): number {
  const now = new Date();
  const seasonStart = new Date(now.getFullYear(), 8, 1); // September 1st
  const weeksPassed = Math.floor(
    (now.getTime() - seasonStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );
  return Math.max(1, Math.min(18, weeksPassed + 1));
}
