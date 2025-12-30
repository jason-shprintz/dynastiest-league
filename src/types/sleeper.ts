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
  r: number;
  m: number;
  t1: number;
  t2: number;
  w: number | null;
  l: number | null;
  t1_from: {
    w?: number;
    l?: number;
  } | null;
  t2_from: {
    w?: number;
    l?: number;
  } | null;
  p: number;
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
