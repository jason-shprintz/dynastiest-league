-- Migration: Create trade_analysis table
-- Description: Stores AI-generated trade analysis for Sleeper trades

CREATE TABLE IF NOT EXISTS trade_analysis (
  transaction_id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  analysis_json TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Index for efficient league queries
CREATE INDEX IF NOT EXISTS idx_trade_analysis_league_id ON trade_analysis(league_id);

-- Index for querying by creation time
CREATE INDEX IF NOT EXISTS idx_trade_analysis_created_at ON trade_analysis(created_at DESC);
