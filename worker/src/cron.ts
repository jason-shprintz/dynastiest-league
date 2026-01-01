/**
 * Cron Job Handler
 * Polls Sleeper for new trades and generates analyses
 */

import type { Env } from "./types";
import {
  fetchTransactions,
  fetchRosters,
  fetchUsers,
  fetchPlayers,
  getCurrentWeek,
} from "./sleeper";
import { generateTradeAnalysis } from "./openai";
import { analysisExists, saveAnalysis } from "./db";

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

    // Filter to completed trades only
    const completedTrades = transactions.filter(
      (tx) => tx.type === "trade" && tx.status === "complete"
    );

    if (completedTrades.length === 0) {
      console.log(`No completed trades found for week ${week}`);
      return 0;
    }

    console.log(`Found ${completedTrades.length} completed trades for week ${week}`);

    // Fetch league data once for all trades
    const [rosters, users, players] = await Promise.all([
      fetchRosters(leagueId),
      fetchUsers(leagueId),
      fetchPlayers(),
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

        // Generate analysis
        const analysis = await generateTradeAnalysis(
          trade,
          rosters,
          users,
          players,
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
  const currentWeek = getCurrentWeek();

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
