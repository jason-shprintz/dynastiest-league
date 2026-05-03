-- Migration: Create draft analysis tables
-- Description: Stores AI-generated pick analysis and team draft grades

CREATE TABLE IF NOT EXISTS draft_pick_analysis (
  draft_id TEXT NOT NULL,
  pick_no INTEGER NOT NULL,
  league_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  analysis_json TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (draft_id, pick_no)
);

-- Index for efficient draft queries
CREATE INDEX IF NOT EXISTS idx_draft_pick_analysis_draft_id ON draft_pick_analysis(draft_id);

CREATE TABLE IF NOT EXISTS team_draft_grade (
  draft_id TEXT NOT NULL,
  roster_id INTEGER NOT NULL,
  league_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  grade_json TEXT NOT NULL,
  analysis_version TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (draft_id, roster_id)
);

-- Index for efficient draft queries
CREATE INDEX IF NOT EXISTS idx_team_draft_grade_draft_id ON team_draft_grade(draft_id);
