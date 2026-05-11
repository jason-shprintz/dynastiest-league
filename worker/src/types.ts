/**
 * Type definitions for Sleeper API responses and Worker types
 */

export interface Env {
  DB: D1Database;
  PLAYERS_KV: KVNamespace;
  ANTHROPIC_API_KEY: string;
  SLEEPER_LEAGUE_ID: string;
  /** @deprecated Use TRADE_ANALYSIS_VERSION instead */
  ANALYSIS_VERSION?: string;
  TRADE_ANALYSIS_VERSION: string;
  DRAFT_ANALYSIS_VERSION: string;
  /** Set to the active draft's Sleeper ID to enable draft analysis; omit to disable */
  LEAGUE_DRAFT_ID?: string;
}

/**
 * Enriched player info stored in KV and used for prompt context
 */
export interface PlayerInfo {
  name: string;
  position: string;
  team?: string;
  age?: number;
  years_exp?: number;
  draft_year?: string;
  search_rank?: number;
}

/**
 * Sleeper Transaction types
 */
export interface SleeperTransaction {
  type: string;
  transaction_id: string;
  status_updated: number;
  status: string;
  settings?: Record<string, unknown> | null;
  roster_ids?: number[];
  metadata?: Record<string, unknown> | null;
  leg: number;
  drops?: Record<string, number> | null;
  draft_picks?: Array<{
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }>;
  creator: string;
  created: number;
  consenter_ids?: number[];
  adds?: Record<string, number> | null;
  waiver_budget?: Array<{
    sender: number;
    receiver: number;
    amount: number;
  }>;
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  taxi?: string[];
  settings: {
    wins: number;
    losses: number;
    fpts: number;
    fpts_against?: number;
  };
}

/**
 * Sleeper League object (partial — only the fields we use)
 */
export interface SleeperLeague {
  league_id: string;
  previous_league_id?: string;
  [key: string]: unknown;
}

export interface SleeperUser {
  user_id: string;
  username: string;
  display_name: string;
  metadata: {
    team_name?: string;
    [key: string]: unknown;
  };
}

/**
 * Sleeper NFL state response
 */
export interface SleeperNflState {
  week: number;
  season_type: string;
  season: string;
  [key: string]: unknown;
}

/**
 * Trade Analysis types
 */
export interface TradeAnalysis {
  transaction_id: string;
  timestamp: number;
  teams: {
    [rosterId: string]: {
      teamName: string;
      grade: string;
      received: {
        players: Array<{
          name: string;
          position: string;
          team: string | null;
        }>;
        picks: Array<{
          season: string;
          round: number;
        }>;
      };
      summary: string;
    };
  };
  conversation: Array<{
    speaker: 'Mike' | 'Jim';
    text: string;
  }>;
  overall_take: string;
}

/**
 * Database record structure
 */
export interface TradeAnalysisRecord {
  transaction_id: string;
  league_id: string;
  created_at: number;
  analysis_json: string;
  analysis_version: string;
  updated_at: number;
}

/**
 * Sleeper Draft object (worker-side)
 */
export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  status: 'pre_draft' | 'drafting' | 'complete' | string;
  settings: {
    rounds: number;
    teams: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Sleeper draft pick (worker-side)
 */
export interface SleeperDraftPick {
  pick_no: number;
  round: number;
  draft_slot: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  metadata: {
    first_name?: string;
    last_name?: string;
    position?: string;
    team?: string;
    [key: string]: unknown;
  } | null;
}

/**
 * Draft pick analysis structure
 */
export interface DraftPickAnalysis {
  pick_id: string; // "draft_id:pick_no"
  draft_id: string;
  pick_no: number;
  grade: string;
  value_vs_adp: string;
  conversation: Array<{
    speaker: 'Mike' | 'Jim';
    text: string;
  }>;
  hot_take: string;
}

/**
 * Team draft grade structure
 */
export interface TeamDraftGrade {
  draft_id: string;
  roster_id: number;
  overall_grade: string;
  best_pick: { pick_no: number; reason: string } | null;
  worst_pick: { pick_no: number; reason: string } | null;
  summary: string;
  conversation: Array<{
    speaker: 'Mike' | 'Jim';
    text: string;
  }>;
}

/**
 * Database record for draft pick analysis
 */
export interface DraftPickAnalysisRecord {
  draft_id: string;
  pick_no: number;
  league_id: string;
  created_at: number;
  analysis_json: string;
  analysis_version: string;
  updated_at: number;
}

/**
 * Database record for team draft grade
 */
export interface TeamDraftGradeRecord {
  draft_id: string;
  roster_id: number;
  league_id: string;
  created_at: number;
  grade_json: string;
  analysis_version: string;
  updated_at: number;
}
