/**
 * Type definitions for Sleeper API responses
 * Based on https://docs.sleeper.com/
 */

/**
 * Represents a Sleeper fantasy sports league.
 * Contains configuration, settings, and metadata for a league instance.
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

/**
 * Represents a team roster in a Sleeper fantasy league.
 *
 * @remarks
 * Contains all roster-related information including player lists,
 * league settings, and ownership details for a single team.
 *
 * @property starters - Array of player IDs currently in starting lineup positions
 * @property settings - Team statistics and settings including wins, losses, points, and waiver info
 * @property roster_id - Unique identifier for this roster within the league
 * @property reserve - Array of player IDs on injured reserve, or null if empty
 * @property taxi - Array of player IDs on the taxi squad (for dynasty leagues), or null if empty
 * @property players - Complete array of all player IDs on the roster
 * @property player_map - Optional mapping of player data, or null if not provided
 * @property owner_id - User ID of the primary roster owner
 * @property metadata - Additional roster metadata, or null if not provided
 * @property league_id - Unique identifier of the league this roster belongs to
 * @property keepers - Array of player IDs designated as keepers, or null if not applicable
 * @property co_owners - Array of user IDs for co-owners, or null if no co-owners
 */
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
  taxi: string[] | null;
  players: string[];
  player_map: Record<string, unknown> | null;
  owner_id: string;
  metadata: Record<string, unknown> | null;
  league_id: string;
  keepers: string[] | null;
  co_owners: string[] | null;
}

/**
 * Represents a weekly matchup entry from the Sleeper API.
 * Contains information about a team's roster, points scored, and matchup pairing.
 *
 * @property starters - Array of player IDs for players in starting lineup positions
 * @property roster_id - Unique identifier for the roster/team in this matchup
 * @property players - Array of all player IDs on the roster (starters and bench)
 * @property matchup_id - Identifier linking two teams playing against each other (teams with same matchup_id are opponents)
 * @property points - Total points scored by this roster in the matchup
 * @property custom_points - Commissioner-assigned custom points override, if any
 * @property starters_points - Array of points scored by each starter, corresponding to starters array order
 * @property players_points - Map of player IDs to their individual point totals
 */
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

/**
 * Represents a Sleeper platform user.
 * @interface User
 * @property {string} user_id - The unique identifier for the user.
 * @property {string} username - The user's username.
 * @property {string} display_name - The user's display name.
 * @property {string} avatar - The user's avatar identifier or URL.
 * @property {object} metadata - Additional metadata associated with the user.
 * @property {string} [metadata.team_name] - Optional custom team name set by the user.
 * @property {Record<string, unknown> | null} settings - User settings configuration, or null if not set.
 */
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

/**
 * Represents a fantasy sports draft from the Sleeper API.
 *
 * @remarks
 * Contains comprehensive information about a draft including its configuration,
 * timing, and participant details.
 *
 * @property type - The type of draft (e.g., "snake", "linear")
 * @property status - Current status of the draft (e.g., "complete", "drafting", "pre_draft")
 * @property start_time - Unix timestamp when the draft started or is scheduled to start
 * @property sport - The sport for this draft (e.g., "nfl")
 * @property settings - Draft configuration settings including roster slots and timing
 * @property settings.teams - Number of teams participating in the draft
 * @property settings.slots_wr - Number of wide receiver roster slots
 * @property settings.slots_te - Number of tight end roster slots
 * @property settings.slots_rb - Number of running back roster slots
 * @property settings.slots_qb - Number of quarterback roster slots
 * @property settings.slots_k - Number of kicker roster slots
 * @property settings.slots_flex - Number of flex roster slots
 * @property settings.slots_def - Number of defense roster slots
 * @property settings.slots_bn - Number of bench roster slots
 * @property settings.rounds - Total number of draft rounds
 * @property settings.pick_timer - Time allowed per pick in seconds
 * @property season_type - Type of season (e.g., "regular")
 * @property season - The season year as a string (e.g., "2024")
 * @property metadata - Optional additional metadata for the draft
 * @property league_id - Unique identifier for the associated league
 * @property last_picked - Unix timestamp of the last pick made
 * @property last_message_time - Unix timestamp of the last chat message
 * @property last_message_id - Unique identifier of the last chat message
 * @property draft_order - Mapping of user IDs to their draft positions, null if not set
 * @property draft_id - Unique identifier for this draft
 * @property creators - Array of user IDs who created the draft, null if not available
 * @property created - Unix timestamp when the draft was created
 */
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

/**
 * Represents a transaction in the Sleeper fantasy football platform.
 * Transactions can include trades, waiver claims, free agent pickups, and other roster moves.
 *
 * @property type - The type of transaction (e.g., "trade", "waiver", "free_agent")
 * @property transaction_id - Unique identifier for the transaction
 * @property status_updated - Timestamp of when the transaction status was last updated
 * @property status - Current status of the transaction (e.g., "complete", "pending")
 * @property settings - Additional transaction settings, if any
 * @property roster_ids - Array of roster IDs involved in the transaction
 * @property metadata - Additional metadata associated with the transaction
 * @property leg - The week/leg number when the transaction occurred
 * @property drops - Map of player IDs to roster IDs for dropped players
 * @property draft_picks - Array of draft picks involved in the transaction
 * @property creator - The user ID of the transaction creator
 * @property created - Timestamp of when the transaction was created
 * @property consenter_ids - Array of roster IDs that have consented to the transaction
 * @property adds - Map of player IDs to roster IDs for added players
 * @property waiver_budget - Array of FAAB (Free Agent Acquisition Budget) transfers between teams
 */
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

/**
 * Represents a draft pick that has been traded between teams in a Sleeper league.
 *
 * @interface TradedPick
 * @property {string} season - The season/year the draft pick is for
 * @property {number} round - The round number of the draft pick
 * @property {number} roster_id - The roster ID associated with the original pick position
 * @property {number} previous_owner_id - The roster ID of the team that traded away the pick
 * @property {number} owner_id - The roster ID of the team that currently owns the pick
 */
export interface TradedPick {
  season: string;
  round: number;
  roster_id: number;
  previous_owner_id: number;
  owner_id: number;
}
