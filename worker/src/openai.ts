/**
 * OpenAI Integration
 * Generates trade analysis using OpenAI API
 */

import OpenAI from "openai";
import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  TradeAnalysis,
} from "./types";

/**
 * JSON schema for structured OpenAI output
 */
const ANALYSIS_SCHEMA = {
  type: "object",
  properties: {
    transaction_id: { type: "string" },
    timestamp: { type: "number" },
    teams: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          grade: { type: "string" },
          received: {
            type: "object",
            properties: {
              players: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    position: { type: "string" },
                    team: { type: ["string", "null"] },
                  },
                  required: ["name", "position", "team"],
                },
              },
              picks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    season: { type: "string" },
                    round: { type: "number" },
                  },
                  required: ["season", "round"],
                },
              },
            },
            required: ["players", "picks"],
          },
          summary: { type: "string" },
        },
        required: ["grade", "received", "summary"],
      },
    },
    conversation: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string", enum: ["Mike", "Jim"] },
          text: { type: "string" },
        },
        required: ["speaker", "text"],
      },
    },
    overall_take: { type: "string" },
  },
  required: [
    "transaction_id",
    "timestamp",
    "teams",
    "conversation",
    "overall_take",
  ],
};

/**
 * Build context about the trade for OpenAI
 */
function buildTradeContext(
  trade: SleeperTransaction,
  rosters: SleeperRoster[],
  users: SleeperUser[]
): string {
  const getTeamName = (rosterId: number): string => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    if (!roster) return `Team ${rosterId}`;
    const user = users.find((u) => u.user_id === roster.owner_id);
    if (!user) return `Team ${rosterId}`;
    return user.metadata?.team_name || user.display_name || user.username;
  };

  const getPlayerInfo = (playerId: string): string => {
    // Without full player database, use player ID and any metadata
    return `Player ID: ${playerId}`;
  };

  let context = `Transaction ID: ${trade.transaction_id}\n`;
  context += `Date: ${new Date(trade.created).toLocaleDateString()}\n\n`;
  context += `Teams involved:\n`;

  const rosterIds = trade.roster_ids ?? [];
  rosterIds.forEach((rosterId) => {
    const teamName = getTeamName(rosterId);
    const roster = rosters.find((r) => r.roster_id === rosterId);
    const record = roster
      ? `${roster.settings.wins}-${roster.settings.losses}`
      : "N/A";

    context += `\n${teamName} (${record}):\n`;
    context += `Received:\n`;

    // Players received
    const adds = trade.adds ?? {};
    Object.entries(adds).forEach(([playerId, addedToRosterId]) => {
      if (addedToRosterId === rosterId) {
        context += `  - ${getPlayerInfo(playerId)}\n`;
      }
    });

    // Picks received
    const draftPicks = trade.draft_picks ?? [];
    draftPicks.forEach((pick) => {
      if (pick.owner_id === rosterId) {
        const originalTeam = getTeamName(pick.roster_id);
        context += `  - ${pick.season} Round ${pick.round} Pick (originally ${originalTeam}'s)\n`;
      }
    });

    // Check if team received nothing
    const receivedPlayers = Object.entries(adds).some(
      ([, r]) => r === rosterId
    );
    const receivedPicks = draftPicks.some((p) => p.owner_id === rosterId);
    if (!receivedPlayers && !receivedPicks) {
      context += `  - Nothing\n`;
    }
  });

  return context;
}

/**
 * Generate AI analysis for a trade
 */
export async function generateTradeAnalysis(
  trade: SleeperTransaction,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  apiKey: string
): Promise<TradeAnalysis> {
  const openai = new OpenAI({ apiKey });

  const context = buildTradeContext(trade, rosters, users);

  const prompt = `You are analyzing a fantasy football trade for a dynasty league. Your job is to create an in-depth, snarky analysis written as a conversation between two sports analysts named Mike and Jim.

Trade Details:
${context}

Instructions:
1. Grade each team's side of the trade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F)
2. Explain what each team received and why
3. Discuss the immediate impact and long-term implications
4. Write the analysis as a natural conversation between Mike and Jim
5. Be snarky and entertaining (think ESPN's talking heads)
6. Make it 6-10 exchanges between Mike and Jim
7. End with an "overall_take" that summarizes the trade in one sentence

Keep the tone fun and engaging, but provide genuine fantasy football insights. Consider factors like:
- Player age and career trajectory
- Team records and whether they're contending or rebuilding
- Positional needs
- Draft pick value
- Dynasty league context (future value matters!)

Return your analysis in the specified JSON format.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a fantasy football analyst who provides entertaining, snarky trade analysis.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "trade_analysis",
        strict: true,
        schema: ANALYSIS_SCHEMA,
      },
    },
    temperature: 0.8,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No content in OpenAI response");
  }

  const analysis = JSON.parse(content) as TradeAnalysis;
  return analysis;
}
