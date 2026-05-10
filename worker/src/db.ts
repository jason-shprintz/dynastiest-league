/**
 * Database Operations
 * Functions to interact with D1 database
 */

import type { Env, TradeAnalysis, TradeAnalysisRecord, DraftPickAnalysis, DraftPickAnalysisRecord, TeamDraftGrade, TeamDraftGradeRecord } from './types';

/**
 * Get trade analysis by transaction ID
 */
export async function getAnalysis(
  db: D1Database,
  transactionId: string,
): Promise<TradeAnalysis | null> {
  const result = await db
    .prepare('SELECT * FROM trade_analysis WHERE transaction_id = ?')
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
  transactionIds: string[],
): Promise<Record<string, TradeAnalysis | null>> {
  if (transactionIds.length === 0) {
    return {};
  }

  // Build parameterized query for batch fetch
  const placeholders = transactionIds.map(() => '?').join(',');
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
      record.analysis_json,
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
  version: string,
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
       updated_at = excluded.updated_at`,
    )
    .bind(
      transactionId,
      leagueId,
      createdAt,
      JSON.stringify(analysis),
      version,
      now,
    )
    .run();
}

/**
 * Get the stored analysis version for a transaction, or null if no record exists
 */
export async function getAnalysisVersion(
  db: D1Database,
  transactionId: string,
): Promise<string | null> {
  const row = await db
    .prepare('SELECT analysis_version FROM trade_analysis WHERE transaction_id = ? LIMIT 1')
    .bind(transactionId)
    .first<{ analysis_version: string }>();
  return row?.analysis_version ?? null;
}

/**
 * Get all analyses for a league
 */
export async function getLeagueAnalyses(
  db: D1Database,
  leagueId: string,
  limit: number = 100,
): Promise<TradeAnalysis[]> {
  const result = await db
    .prepare(
      'SELECT analysis_json FROM trade_analysis WHERE league_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .bind(leagueId, limit)
    .all<{ analysis_json: string }>();

  return result.results.map(
    (r) => JSON.parse(r.analysis_json) as TradeAnalysis,
  );
}

// ─── Draft Pick Analysis ─────────────────────────────────────────────────────

/**
 * Get the stored analysis version for a draft pick, or null if no record exists
 */
export async function getPickAnalysisVersion(
  db: D1Database,
  draftId: string,
  pickNo: number,
): Promise<string | null> {
  const row = await db
    .prepare('SELECT analysis_version FROM draft_pick_analysis WHERE draft_id = ? AND pick_no = ? LIMIT 1')
    .bind(draftId, pickNo)
    .first<{ analysis_version: string }>();
  return row?.analysis_version ?? null;
}

/**
 * Save a draft pick analysis to the database
 */
export async function savePickAnalysis(
  db: D1Database,
  draftId: string,
  pickNo: number,
  leagueId: string,
  analysis: DraftPickAnalysis,
  version: string,
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO draft_pick_analysis
       (draft_id, pick_no, league_id, created_at, analysis_json, analysis_version, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(draft_id, pick_no) DO UPDATE SET
       analysis_json = excluded.analysis_json,
       analysis_version = excluded.analysis_version,
       updated_at = excluded.updated_at`,
    )
    .bind(draftId, pickNo, leagueId, now, JSON.stringify(analysis), version, now)
    .run();
}

/**
 * Get all draft pick analyses for a draft, returned as a map keyed by pick_no
 */
export async function getDraftPickAnalyses(
  db: D1Database,
  draftId: string,
): Promise<Record<number, DraftPickAnalysis>> {
  const result = await db
    .prepare('SELECT pick_no, analysis_json FROM draft_pick_analysis WHERE draft_id = ? ORDER BY pick_no ASC')
    .bind(draftId)
    .all<DraftPickAnalysisRecord>();

  const map: Record<number, DraftPickAnalysis> = {};
  result.results.forEach((row) => {
    map[row.pick_no] = JSON.parse(row.analysis_json) as DraftPickAnalysis;
  });
  return map;
}

// ─── Team Draft Grade ────────────────────────────────────────────────────────

/**
 * Get the stored analysis version for a team draft grade, or null if no record exists
 */
export async function getTeamDraftGradeVersion(
  db: D1Database,
  draftId: string,
  rosterId: number,
): Promise<string | null> {
  const row = await db
    .prepare('SELECT analysis_version FROM team_draft_grade WHERE draft_id = ? AND roster_id = ? LIMIT 1')
    .bind(draftId, rosterId)
    .first<{ analysis_version: string }>();
  return row?.analysis_version ?? null;
}

/**
 * Save a team draft grade to the database
 */
export async function saveTeamDraftGrade(
  db: D1Database,
  draftId: string,
  rosterId: number,
  leagueId: string,
  grade: TeamDraftGrade,
  version: string,
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO team_draft_grade
       (draft_id, roster_id, league_id, created_at, grade_json, analysis_version, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(draft_id, roster_id) DO UPDATE SET
       grade_json = excluded.grade_json,
       analysis_version = excluded.analysis_version,
       updated_at = excluded.updated_at`,
    )
    .bind(draftId, rosterId, leagueId, now, JSON.stringify(grade), version, now)
    .run();
}

/**
 * Get all team draft grades for a draft, returned as a map keyed by roster_id
 */
export async function getTeamDraftGrades(
  db: D1Database,
  draftId: string,
): Promise<Record<number, TeamDraftGrade>> {
  const result = await db
    .prepare('SELECT roster_id, grade_json FROM team_draft_grade WHERE draft_id = ? ORDER BY roster_id ASC')
    .bind(draftId)
    .all<TeamDraftGradeRecord>();

  const map: Record<number, TeamDraftGrade> = {};
  result.results.forEach((row) => {
    map[row.roster_id] = JSON.parse(row.grade_json) as TeamDraftGrade;
  });
  return map;
}
