/**
 * Type definitions for Sleeper API responses
 * Based on https://docs.sleeper.com/
 */

export interface League {
  total_rosters: number;
  status: string;
  sport: string;
  settings: Record<string, unknown>;
  season_type: string;
  season: string;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  previous_league_id: string;
  name: string;
  league_id: string;
  draft_id: string;
  avatar: string;
  bracket_id: number | null;
  metadata: Record<string, unknown> | null;
}

export interface Roster {
  starters: string[];
  settings: {
    wins: number;
    waiver_position: number;
    waiver_budget_used: number;
    total_moves: number;
    ties: number;
    losses: number;
    fpts_decimal: number;
    fpts_against_decimal: number;
    fpts_against: number;
    fpts: number;
  };
  roster_id: number;
  reserve: string[] | null;
  players: string[];
  player_map: Record<string, unknown> | null;
  owner_id: string;
  metadata: Record<string, unknown> | null;
  league_id: string;
  keepers: string[] | null;
  co_owners: string[] | null;
}

export interface Matchup {
  starters: string[];
  roster_id: number;
  players: string[];
  matchup_id: number;
  points: number;
  custom_points: number | null;
  starters_points: number[] | null;
  players_points: Record<string, number> | null;
}

export interface User {
  user_id: string;
  username: string;
  display_name: string;
  avatar: string;
  metadata: {
    team_name?: string;
    [key: string]: unknown;
  };
  settings: Record<string, unknown> | null;
}

export interface PlayoffBracket {
  /**
   * Round number within the playoff bracket (e.g., 1 = first round).
   */
  r: number;
  /**
   * Matchup identifier within the round.
   */
  m: number;
  /**
   * Roster ID for team 1 in this matchup.
   */
  t1: number;
  /**
   * Roster ID for team 2 in this matchup.
   */
  t2: number;
  /**
   * Roster ID of the winner of this matchup (null if not yet decided).
   */
  w: number | null;
  /**
   * Roster ID of the loser of this matchup (null if not yet decided).
   */
  l: number | null;
  /**
   * Source matchup for team 1, indicating which previous matchup's
   * winner/loser advanced into the t1 slot.
   */
  t1_from: {
    /**
     * Matchup ID whose winner advances to team 1 in this matchup.
     */
    w?: number;
    /**
     * Matchup ID whose loser advances to team 1 in this matchup.
     */
    l?: number;
  } | null;
  /**
   * Source matchup for team 2, indicating which previous matchup's
   * winner/loser advanced into the t2 slot.
   */
  t2_from: {
    /**
     * Matchup ID whose winner advances to team 2 in this matchup.
     */
    w?: number;
    /**
     * Matchup ID whose loser advances to team 2 in this matchup.
     */
    l?: number;
  } | null;
  /**
   * Position or seed of this matchup within the overall playoff bracket.
   */
  p: number;
  /**
   * Additional metadata provided by Sleeper for this playoff matchup.
   */
  metadata: Record<string, unknown> | null;
}

export interface Draft {
  type: string;
  status: string;
  start_time: number;
  sport: string;
  settings: {
    teams: number;
    slots_wr: number;
    slots_te: number;
    slots_rb: number;
    slots_qb: number;
    slots_k: number;
    slots_flex: number;
    slots_def: number;
    slots_bn: number;
    rounds: number;
    pick_timer: number;
    [key: string]: unknown;
  };
  season_type: string;
  season: string;
  metadata: Record<string, unknown> | null;
  league_id: string;
  last_picked: number;
  last_message_time: number;
  last_message_id: string;
  draft_order: Record<string, number> | null;
  draft_id: string;
  creators: string[] | null;
  created: number;
}

export interface Transaction {
  type: string;
  transaction_id: string;
  status_updated: number;
  status: string;
  settings: Record<string, unknown> | null;
  roster_ids: number[];
  metadata: Record<string, unknown> | null;
  leg: number;
  drops: Record<string, number> | null;
  draft_picks: Array<{
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }>;
  creator: string;
  created: number;
  consenter_ids: number[];
  adds: Record<string, number> | null;
  waiver_budget: Array<{
    sender: number;
    receiver: number;
    amount: number;
  }>;
}

export interface TradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}
