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
} from './sleeper';
import { generateTradeAnalysis } from './anthropic';
import { analysisExists, saveAnalysis } from './db';

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

    // Process each trade
    for (const trade of completedTrades) {
      try {
        // Skip if we've already seen this transaction (dedupe across weeks)
        if (seenTransactionIds.has(trade.transaction_id)) {
          console.log(
            `Already processed ${trade.transaction_id} in another week, skipping`,
          );
          continue;
        }
        seenTransactionIds.add(trade.transaction_id);

        // Check if analysis already exists
        const exists = await analysisExists(env.DB, trade.transaction_id);
        if (exists) {
          console.log(
            `Analysis already exists for ${trade.transaction_id}, skipping`,
          );
          continue;
        }

        console.log(`Generating analysis for trade ${trade.transaction_id}...`);

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

        // Save to database
        await saveAnalysis(
          env.DB,
          trade.transaction_id,
          leagueId,
          createdAt,
          analysis,
          env.ANALYSIS_VERSION,
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
}
