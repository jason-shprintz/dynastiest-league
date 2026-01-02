/**
 * Type definitions for Sleeper API responses and Worker types
 */

export interface Env {
  DB: D1Database;
  OPENAI_API_KEY: string;
  SLEEPER_LEAGUE_ID: string;
  ANALYSIS_VERSION: string;
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
  settings: {
    wins: number;
    losses: number;
    fpts: number;
  };
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
    speaker: "Mike" | "Jim";
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
