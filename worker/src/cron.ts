/**
 * Cron Job Handler
 * Polls Sleeper for new trades and generates analyses
 */

import type { Env, SleeperTransaction } from "./types";
import {
  fetchTransactions,
  fetchRosters,
  fetchUsers,
  getCurrentWeek,
} from "./sleeper";
import { generateTradeAnalysis } from "./openai";
import { analysisExists, saveAnalysis } from "./db";

/**
 * Check if a transaction is a processed trade
 */
function isProcessedTrade(tx: SleeperTransaction): boolean {
  // Must be a trade
  if (tx.type !== "trade") {
    return false;
  }

  // Accept multiple status values that indicate completion
  const validStatuses = ["complete", "completed"];
  const hasValidStatus = validStatuses.includes(tx.status?.toLowerCase() || "");

  // Also check if status_updated has a positive value (indicates processing)
  const hasStatusUpdate = !!(tx.status_updated && tx.status_updated > 0);

  // Log trades that don't match expected criteria for debugging
  if (!hasValidStatus && !hasStatusUpdate) {
    console.log(
      `Trade ${tx.transaction_id} has unexpected status: "${tx.status}", status_updated: ${tx.status_updated}`
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
  week: number
): Promise<number> {
  console.log(`Processing trades for week ${week}...`);

  try {
    const transactions = await fetchTransactions(leagueId, week);

    // Filter to processed trades using robust detection
    const completedTrades = transactions.filter(isProcessedTrade);

    if (completedTrades.length === 0) {
      console.log(`No completed trades found for week ${week}`);
      return 0;
    }

    console.log(`Found ${completedTrades.length} completed trades for week ${week}`);

    // Fetch league data once for all trades
    const [rosters, users] = await Promise.all([
      fetchRosters(leagueId),
      fetchUsers(leagueId),
    ]);

    let processed = 0;

    // Process each trade
    for (const trade of completedTrades) {
      try {
        // Check if analysis already exists
        const exists = await analysisExists(env.DB, trade.transaction_id);
        if (exists) {
          console.log(`Analysis already exists for ${trade.transaction_id}, skipping`);
          continue;
        }

        console.log(`Generating analysis for trade ${trade.transaction_id}...`);

        // Generate analysis (without full player database)
        const analysis = await generateTradeAnalysis(
          trade,
          rosters,
          users,
          env.OPENAI_API_KEY
        );

        // Save to database
        await saveAnalysis(
          env.DB,
          trade.transaction_id,
          leagueId,
          trade.created,
          analysis,
          env.ANALYSIS_VERSION
        );

        console.log(`Successfully saved analysis for ${trade.transaction_id}`);
        processed++;
      } catch (error) {
        console.error(
          `Error processing trade ${trade.transaction_id}:`,
          error
        );
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
  console.log("Cron job started");

  const leagueId = env.SLEEPER_LEAGUE_ID;
  const currentWeek = await getCurrentWeek();

  // Poll current week and previous week to avoid edge cases
  const weeksToCheck = [currentWeek, Math.max(1, currentWeek - 1)];

  console.log(`Checking weeks: ${weeksToCheck.join(", ")}`);

  let totalProcessed = 0;

  for (const week of weeksToCheck) {
    const processed = await processWeekTrades(env, leagueId, week);
    totalProcessed += processed;
  }

  console.log(
    `Cron job completed. Processed ${totalProcessed} new trade(s)`
  );
}
