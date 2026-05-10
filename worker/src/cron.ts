/**
 * Cron Job Handler
 * Polls Sleeper for new trades and generates analyses
 */

import type {
  Env,
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  SleeperNflState,
  PlayerInfo,
} from './types';
import {
  fetchTransactions,
  fetchRosters,
  fetchUsers,
  fetchLeague,
  fetchNflState,
  filterPlayerMap,
  getPlayerMap,
  fetchDraft,
  fetchDraftPicks,
  fetchLeagueDrafts,
} from './sleeper';
import { generateTradeAnalysis } from './anthropic';
import { generatePickAnalysis, generateTeamDraftGrade } from './draftAnalysis';
import { getRookieValueMap } from './rookieValues';
import { getAnalysisVersion, saveAnalysis, getPickAnalysisVersion, savePickAnalysis, getTeamDraftGradeVersion, saveTeamDraftGrade } from './db';

/**
 * Compute position counts for a single roster's player list.
 * Returns e.g. { QB: 2, RB: 5, WR: 6, TE: 2, K: 1 }
 */
function computeRosterShape(
  playerIds: string[],
  playerMap: Record<string, PlayerInfo>,
): Record<string, number> {
  const shape: Record<string, number> = {};
  for (const id of playerIds) {
    const p = playerMap[id];
    if (!p) continue;
    const pos = p.position ?? '?';
    shape[pos] = (shape[pos] ?? 0) + 1;
  }
  return shape;
}

/**
 * Check if a transaction is a processed trade
 */
function isProcessedTrade(tx: SleeperTransaction): boolean {
  // Must be a trade
  if (tx.type !== 'trade') {
    return false;
  }

  // Accept multiple status values that indicate completion
  const validStatuses = ['complete', 'completed'];
  const hasValidStatus = validStatuses.includes(tx.status?.toLowerCase() || '');

  // Also check if status_updated has a positive value (indicates processing)
  const hasStatusUpdate = !!(tx.status_updated && tx.status_updated > 0);

  // Only log unexpected status if status is defined but status_updated is missing/0
  if (!hasValidStatus && !hasStatusUpdate && tx.status && tx.status.trim()) {
    console.log(
      `Trade ${tx.transaction_id} has unexpected status: "${tx.status}", status_updated: ${tx.status_updated}`,
    );
  }

  // Accept if either condition is met
  return hasValidStatus || hasStatusUpdate;
}

/**
 * Per-tick processing caps to prevent Worker timeout and runaway Anthropic spend.
 * Version-bump rollout is paced across successive cron ticks rather than all-at-once.
 */
const MAX_TRADES_PER_TICK = 5;
const MAX_PICKS_PER_TICK = 3;
const MAX_GRADES_PER_TICK = 2;

/**
 * Process trades for a specific week
 */
async function processWeekTrades(
  env: Env,
  leagueId: string,
  week: number,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  nflState: SleeperNflState,
  allPlayers: Record<string, PlayerInfo>,
  priorSeasonRecords: Record<string, { wins: number; losses: number; fpts: number; fpts_against?: number }>,
  seenTransactionIds: Set<string>,
): Promise<number> {
  console.log(`Processing trades for week ${week}...`);

  const currentVersion = env.TRADE_ANALYSIS_VERSION;
  if (!currentVersion) {
    console.error('TRADE_ANALYSIS_VERSION is unset — skipping trade processing this tick');
    return 0;
  }

  try {
    const transactions = await fetchTransactions(leagueId, week);

    // Defensive: treat null/undefined as empty array
    const safeTransactions = transactions ?? [];

    // Filter to processed trades using robust detection
    const completedTrades = safeTransactions.filter(isProcessedTrade);

    if (completedTrades.length === 0) {
      console.log(`No completed trades found for week ${week}`);
      return 0;
    }

    console.log(
      `Found ${completedTrades.length} completed trades for week ${week}`,
    );

    let processed = 0;

    // Process each trade (capped per tick to pace version-bump rollout)
    for (const trade of completedTrades) {
      if (processed >= MAX_TRADES_PER_TICK) {
        console.log(`Reached per-tick trade cap (${MAX_TRADES_PER_TICK}); remaining trades will be processed next tick`);
        break;
      }

      try {
        // Skip if we've already seen this transaction (dedupe across weeks)
        if (seenTransactionIds.has(trade.transaction_id)) {
          console.log(`Already processed ${trade.transaction_id} in another week, skipping`);
          continue;
        }
        seenTransactionIds.add(trade.transaction_id);

        // Check the stored version — skip if current, regenerate if stale or missing
        const existingVersion = await getAnalysisVersion(env.DB, trade.transaction_id);

        if (existingVersion === currentVersion) {
          // Already at current version — skip silently
          continue;
        }

        const action = existingVersion === null
          ? `Generating new analysis for ${trade.transaction_id}`
          : `Regenerating analysis for ${trade.transaction_id} (${existingVersion} → ${currentVersion})`;
        console.log(action);

        // Filter the already-loaded player map — no extra KV round-trip needed
        const playerIds = Object.keys(trade.adds ?? {});
        const playerNames = filterPlayerMap(playerIds, allPlayers);

        // Compute roster shape (position counts) for each team involved
        const rosterShapes: Record<number, Record<string, number>> = {};
        for (const rosterId of trade.roster_ids ?? []) {
          const roster = rosters.find((r) => r.roster_id === rosterId);
          if (roster) {
            rosterShapes[rosterId] = computeRosterShape(
              roster.players ?? [],
              allPlayers,
            );
          }
        }

        const analysis = await generateTradeAnalysis(
          trade,
          rosters,
          users,
          playerNames,
          env.ANTHROPIC_API_KEY,
          nflState,
          rosterShapes,
          priorSeasonRecords,
        );

        // Use fallback for created timestamp
        const createdAt = trade.created ?? Date.now();

        // Save to database (UPSERT — handles both first-time and version-bump regeneration)
        await saveAnalysis(
          env.DB,
          trade.transaction_id,
          leagueId,
          createdAt,
          analysis,
          currentVersion,
        );

        console.log(`Successfully saved analysis for ${trade.transaction_id}`);
        processed++;
      } catch (error) {
        console.error(`Error processing trade ${trade.transaction_id}:`, error);
        // Continue processing other trades even if one fails
      }
    }

    return processed;
  } catch (error) {
    console.error(`Error processing week ${week}:`, error);
    return 0;
  }
}

/**
 * Resolve which draft the cron should analyze.
 *
 * Priority:
 *   1. env.LEAGUE_DRAFT_ID — explicit override, useful for targeting a specific
 *      draft (e.g. a startup draft from a prior season).
 *   2. The active draft for this league (status === 'drafting').
 *   3. The most recent completed draft (so post-draft team grades can still be
 *      generated even if the cron didn't catch the completion live).
 *
 * Returns null when nothing analyzable exists (e.g. only pre_draft entries, or
 * the league has no drafts yet).
 */
async function resolveDraftId(env: Env, leagueId: string): Promise<string | null> {
  if (env.LEAGUE_DRAFT_ID) {
    return env.LEAGUE_DRAFT_ID;
  }

  try {
    const drafts = await fetchLeagueDrafts(leagueId);
    // Sleeper returns drafts in reverse chronological order. Skip pre_draft —
    // there are no picks to analyze yet.
    const active = drafts.find((d) => d.status === 'drafting');
    if (active) {
      console.log(`Auto-detected active draft: ${active.draft_id}`);
      return active.draft_id;
    }
    const completedDrafts = drafts.filter((d) => d.status === 'complete');
    const getDraftRecency = (draft: (typeof completedDrafts)[number]): number => {
      const lastPicked =
        typeof draft.last_picked === 'number' ? draft.last_picked : null;
      const startTime =
        typeof draft.start_time === 'number' ? draft.start_time : null;
      const created = typeof draft.created === 'number' ? draft.created : null;
      return lastPicked ?? startTime ?? created ?? 0;
    };
    const recentComplete = completedDrafts.reduce<
      (typeof completedDrafts)[number] | null
    >((latest, current) => {
      if (!latest) return current;
      const latestRecency = getDraftRecency(latest);
      const currentRecency = getDraftRecency(current);
      return currentRecency > latestRecency ? current : latest;
    }, null);
    if (recentComplete) {
      console.log(
        `Auto-detected most recent completed draft: ${recentComplete.draft_id}`,
      );
      return recentComplete.draft_id;
    }
    console.log('No active or completed draft found for this league');
    return null;
  } catch (err) {
    console.error('Error auto-detecting league draft:', err);
    return null;
  }
}

/**
 * Handle scheduled cron trigger
 */
export async function handleScheduled(env: Env): Promise<void> {
  console.log('Cron job started');

  const leagueId = env.SLEEPER_LEAGUE_ID;
  const nflState = await fetchNflState();
  const currentWeek = nflState.week || 1;
  const isOffseason = nflState.season_type === 'off' || nflState.week === 0;

  // During the offseason dynasty leagues still trade, and Sleeper files those
  // transactions across whatever week number is current (often 1–18). Scan all
  // 18 weeks so no trade is missed. In-season, only current + previous week
  // need checking since the cron runs every 5 minutes.
  const weeksToCheck: number[] = isOffseason
    ? Array.from({ length: 18 }, (_, i) => i + 1)
    : [currentWeek, Math.max(1, currentWeek - 1)];

  console.log(
    `Season type: ${nflState.season_type}, week: ${nflState.week}. Checking weeks: ${weeksToCheck.join(', ')}`,
  );

  // Fetch league data once — shared across all week scans
  const [rosters, users, allPlayers] = await Promise.all([
    fetchRosters(leagueId),
    fetchUsers(leagueId),
    getPlayerMap(env.PLAYERS_KV),
  ]);

  // Fetch prior-season records when in-season so the model has performance
  // context beyond the current (potentially early-season) W-L record.
  const priorSeasonRecords: Record<
    string,
    { wins: number; losses: number; fpts: number; fpts_against?: number }
  > = {};

  if (!isOffseason) {
    try {
      const league = await fetchLeague(leagueId);
      if (league.previous_league_id) {
        const prevRosters = await fetchRosters(league.previous_league_id);
        for (const r of prevRosters) {
          if (r.owner_id) {
            priorSeasonRecords[r.owner_id] = {
              wins: r.settings.wins,
              losses: r.settings.losses,
              fpts: r.settings.fpts,
              fpts_against: r.settings.fpts_against,
            };
          }
        }
        console.log(
          `Loaded prior-season records for ${Object.keys(priorSeasonRecords).length} teams`,
        );
      }
    } catch (err) {
      console.error('Failed to fetch prior-season records:', err);
      // Non-fatal — analysis will proceed without prior-season data
    }
  }

  // Track seen transaction IDs to avoid processing duplicates across weeks
  const seenTransactionIds = new Set<string>();
  let totalProcessed = 0;

  for (const week of weeksToCheck) {
    const processed = await processWeekTrades(
      env,
      leagueId,
      week,
      rosters,
      users,
      nflState,
      allPlayers,
      priorSeasonRecords,
      seenTransactionIds,
    );
    totalProcessed += processed;
  }

  console.log(`Cron job completed. Processed ${totalProcessed} new trade(s)`);

  // Draft analysis — auto-detects the active draft from the league when
  // LEAGUE_DRAFT_ID is unset. Manual override via env var still wins.
  const draftId = await resolveDraftId(env, leagueId);
  if (draftId) {
    try {
      await processDraftAnalysis(env, draftId, leagueId, rosters, users, allPlayers);
    } catch (err) {
      console.error('Error processing draft analysis:', err);
    }
  }
}

/**
 * Process draft picks — generates per-pick analyses and, when complete, per-team grades.
 * Per-tick caps prevent Worker timeout and runaway Anthropic spend.
 */
async function processDraftAnalysis(
  env: Env,
  draftId: string,
  leagueId: string,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
): Promise<void> {
  console.log(`Processing draft analysis for draft ${draftId}...`);

  const version = env.DRAFT_ANALYSIS_VERSION;
  if (!version) {
    console.error('DRAFT_ANALYSIS_VERSION is unset — skipping draft processing this tick');
    return;
  }

  const [draft, picks, rookieValues] = await Promise.all([
    fetchDraft(draftId),
    fetchDraftPicks(draftId),
    // FantasyCalc dynasty values, cached in KV with 24h TTL. Returns an empty
    // map on failure — the analysis functions will still run, they just won't
    // have ADP context for that tick.
    getRookieValueMap(env.PLAYERS_KV),
  ]);

  if (picks.length === 0) {
    console.log('No picks yet in this draft, skipping');
    return;
  }

  // Process each pick — regenerate if missing or version-stale (capped per tick)
  let picksAnalyzed = 0;
  for (let i = 0; i < picks.length; i++) {
    if (picksAnalyzed >= MAX_PICKS_PER_TICK) {
      console.log(`Reached per-tick pick cap (${MAX_PICKS_PER_TICK}); remaining picks will be processed next tick`);
      break;
    }

    const pick = picks[i];
    try {
      const existingVersion = await getPickAnalysisVersion(env.DB, draftId, pick.pick_no);

      if (existingVersion === version) {
        // Already at current version — skip silently
        continue;
      }

      const action = existingVersion === null
        ? `Generating new analysis for pick #${pick.pick_no}`
        : `Regenerating analysis for pick #${pick.pick_no} (${existingVersion} → ${version})`;
      console.log(action);

      // Prior picks for context (all picks before this one)
      const priorPicks = picks.slice(0, i);

      const analysis = await generatePickAnalysis(
        pick,
        draftId,
        rosters,
        users,
        playerMap,
        priorPicks,
        rookieValues,
        draft.settings.rounds,
        draft.settings.teams,
        env.ANTHROPIC_API_KEY,
      );

      await savePickAnalysis(env.DB, draftId, pick.pick_no, leagueId, analysis, version);
      console.log(`Saved analysis for pick #${pick.pick_no}`);
      picksAnalyzed++;
    } catch (err) {
      console.error(`Error analyzing pick #${pick.pick_no}:`, err);
      // Continue with other picks
    }
  }

  console.log(`Draft pick analysis: ${picksAnalyzed} new/updated pick(s) analyzed`);

  // Check for draft completion — generate team grades when done
  const totalExpectedPicks = draft.settings.rounds * draft.settings.teams;
  const isDraftComplete =
    draft.status === 'complete' ||
    picks.length >= totalExpectedPicks;

  if (!isDraftComplete) {
    console.log(`Draft not yet complete (${picks.length}/${totalExpectedPicks} picks)`);
    return;
  }

  console.log('Draft is complete — generating team grades...');

  // Group picks by roster_id
  const picksByRoster: Record<number, typeof picks> = {};
  for (const pick of picks) {
    if (!picksByRoster[pick.roster_id]) {
      picksByRoster[pick.roster_id] = [];
    }
    picksByRoster[pick.roster_id].push(pick);
  }

  let teamsGraded = 0;
  for (const [rosterIdStr, teamPicks] of Object.entries(picksByRoster)) {
    if (teamsGraded >= MAX_GRADES_PER_TICK) {
      console.log(`Reached per-tick grade cap (${MAX_GRADES_PER_TICK}); remaining grades will be processed next tick`);
      break;
    }

    const rosterId = Number(rosterIdStr);
    try {
      const existingVersion = await getTeamDraftGradeVersion(env.DB, draftId, rosterId);

      if (existingVersion === version) {
        // Already at current version — skip silently
        continue;
      }

      const action = existingVersion === null
        ? `Generating new team grade for roster ${rosterId}`
        : `Regenerating team grade for roster ${rosterId} (${existingVersion} → ${version})`;
      console.log(action);

      const grade = await generateTeamDraftGrade(
        rosterId,
        draftId,
        teamPicks,
        rosters,
        users,
        playerMap,
        rookieValues,
        env.ANTHROPIC_API_KEY,
      );

      await saveTeamDraftGrade(env.DB, draftId, rosterId, leagueId, grade, version);
      console.log(`Saved team grade for roster ${rosterId}`);
      teamsGraded++;
    } catch (err) {
      console.error(`Error grading roster ${rosterId}:`, err);
    }
  }

  console.log(`Team draft grades: ${teamsGraded} new/updated grade(s) generated`);
}
