/**
 * Database Operations
 * Functions to interact with D1 database
 */

import type { Env, TradeAnalysis, TradeAnalysisRecord } from "./types";

/**
 * Get trade analysis by transaction ID
 */
export async function getAnalysis(
  db: D1Database,
  transactionId: string
): Promise<TradeAnalysis | null> {
  const result = await db
    .prepare(
      "SELECT * FROM trade_analysis WHERE transaction_id = ?"
    )
    .bind(transactionId)
    .first<TradeAnalysisRecord>();

  if (!result) {
    return null;
  }

  return JSON.parse(result.analysis_json) as TradeAnalysis;
}

/**
 * Get multiple trade analyses by transaction IDs
 */
export async function getBatchAnalyses(
  db: D1Database,
  transactionIds: string[]
): Promise<Record<string, TradeAnalysis | null>> {
  if (transactionIds.length === 0) {
    return {};
  }

  // Build parameterized query for batch fetch
  const placeholders = transactionIds.map(() => "?").join(",");
  const query = `SELECT * FROM trade_analysis WHERE transaction_id IN (${placeholders})`;

  const result = await db
    .prepare(query)
    .bind(...transactionIds)
    .all<TradeAnalysisRecord>();

  const analyses: Record<string, TradeAnalysis | null> = {};
  
  // Initialize all IDs to null
  transactionIds.forEach((id) => {
    analyses[id] = null;
  });

  // Fill in the ones we found
  result.results.forEach((record) => {
    analyses[record.transaction_id] = JSON.parse(
      record.analysis_json
    ) as TradeAnalysis;
  });

  return analyses;
}

/**
 * Save trade analysis to database
 */
export async function saveAnalysis(
  db: D1Database,
  transactionId: string,
  leagueId: string,
  createdAt: number,
  analysis: TradeAnalysis,
  version: string
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO trade_analysis 
       (transaction_id, league_id, created_at, analysis_json, analysis_version, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(transaction_id) DO UPDATE SET
       analysis_json = excluded.analysis_json,
       analysis_version = excluded.analysis_version,
       updated_at = excluded.updated_at`
    )
    .bind(
      transactionId,
      leagueId,
      createdAt,
      JSON.stringify(analysis),
      version,
      now
    )
    .run();
}

/**
 * Check if analysis exists for a transaction
 */
export async function analysisExists(
  db: D1Database,
  transactionId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      "SELECT 1 FROM trade_analysis WHERE transaction_id = ? LIMIT 1"
    )
    .bind(transactionId)
    .first();

  return result !== null;
}

/**
 * Get all analyses for a league
 */
export async function getLeagueAnalyses(
  db: D1Database,
  leagueId: string,
  limit: number = 100
): Promise<TradeAnalysis[]> {
  const result = await db
    .prepare(
      "SELECT analysis_json FROM trade_analysis WHERE league_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .bind(leagueId, limit)
    .all<{ analysis_json: string }>();

  return result.results.map((r) => JSON.parse(r.analysis_json) as TradeAnalysis);
}
