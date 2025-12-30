/**
 * Sleeper API Service
 * Provides functions to fetch data from the Sleeper fantasy football API
 * API Documentation: https://docs.sleeper.com/
 */

import type {
  League,
  Roster,
  Matchup,
  User,
  PlayoffBracket,
  Draft,
  Transaction,
  TradedPick,
} from "../types/sleeper";

const SLEEPER_API_BASE = "https://api.sleeper.app/v1";

/**
 * Fetch a specific league by ID
 * @param leagueId - The ID of the league
 * @returns League data
 */
export async function fetchLeague(leagueId: string): Promise<League> {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch league: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all rosters in a league
 * @param leagueId - The ID of the league
 * @returns Array of roster data
 */
export async function fetchRosters(leagueId: string): Promise<Roster[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/rosters`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch rosters: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all matchups for a specific week in a league
 * @param leagueId - The ID of the league
 * @param week - The week number
 * @returns Array of matchup data
 */
export async function fetchMatchups(
  leagueId: string,
  week: number,
): Promise<Matchup[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/matchups/${week}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch matchups: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all users in a league
 * @param leagueId - The ID of the league
 * @returns Array of user data
 */
export async function fetchUsers(leagueId: string): Promise<User[]> {
  const response = await fetch(`${SLEEPER_API_BASE}/league/${leagueId}/users`);
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch the playoff bracket for a league
 * @param leagueId - The ID of the league
 * @returns Array of playoff bracket data
 */
export async function fetchPlayoffBracket(
  leagueId: string,
): Promise<PlayoffBracket[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/winners_bracket`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch playoff bracket: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch drafts for a league
 * @param leagueId - The ID of the league
 * @returns Array of draft data
 */
export async function fetchDrafts(leagueId: string): Promise<Draft[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/drafts`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch drafts: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch transactions for a specific week in a league
 * @param leagueId - The ID of the league
 * @param week - The week number
 * @returns Array of transaction data
 */
export async function fetchTransactions(
  leagueId: string,
  week: number,
): Promise<Transaction[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/transactions/${week}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all traded picks in a league
 * @param leagueId - The ID of the league
 * @returns Array of traded pick data
 */
export async function fetchTradedPicks(
  leagueId: string,
): Promise<TradedPick[]> {
  const response = await fetch(
    `${SLEEPER_API_BASE}/league/${leagueId}/traded_picks`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch traded picks: ${response.statusText}`);
  }
  return response.json();
}
