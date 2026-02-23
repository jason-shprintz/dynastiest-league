/**
 * AI Integration (Anthropic Claude)
 * Generates trade analysis using Anthropic Claude API
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  SleeperTransaction,
  SleeperRoster,
  SleeperUser,
  TradeAnalysis,
} from './types';

/**
 * JSON schema for structured Claude tool output
 */
const ANALYSIS_SCHEMA = {
  type: 'object' as const,
  properties: {
    transaction_id: { type: 'string' },
    timestamp: { type: 'number' },
    teams: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          teamName: { type: 'string' },
          grade: { type: 'string' },
          received: {
            type: 'object',
            properties: {
              players: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    position: { type: 'string' },
                    team: { type: 'string' },
                  },
                  required: ['name', 'position', 'team'],
                },
              },
              picks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    season: { type: 'string' },
                    round: { type: 'number' },
                  },
                  required: ['season', 'round'],
                },
              },
            },
            required: ['players', 'picks'],
          },
          summary: { type: 'string' },
        },
        required: ['teamName', 'grade', 'received', 'summary'],
      },
    },
    conversation: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          speaker: { type: 'string', enum: ['Mike', 'Jim'] },
          text: { type: 'string' },
        },
        required: ['speaker', 'text'],
      },
    },
    overall_take: { type: 'string' },
  },
  required: [
    'transaction_id',
    'timestamp',
    'teams',
    'conversation',
    'overall_take',
  ],
};

/**
 * Build context about the trade for Claude
 */
function buildTradeContext(
  trade: SleeperTransaction,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerNames: Record<string, { name: string; position: string }>,
): string {
  const getTeamName = (rosterId: number): string => {
    const roster = rosters.find((r) => r.roster_id === rosterId);
    if (!roster) return `Team ${rosterId}`;
    const user = users.find((u) => u.user_id === roster.owner_id);
    if (!user) return `Team ${rosterId}`;
    return user.metadata?.team_name || user.display_name || user.username;
  };

  const resolvePlayerName = (playerId: string): string => {
    if (playerNames[playerId]) {
      const { name, position } = playerNames[playerId];
      return `${name} (${position})`;
    }
    return `Player ID: ${playerId}`;
  };

  const createdAt = trade.created ?? Date.now();
  let context = `Transaction ID: ${trade.transaction_id}\n`;
  context += `Date: ${new Date(createdAt).toLocaleDateString()}\n\n`;
  context += `Teams involved:\n`;

  const rosterIds = trade.roster_ids ?? [];
  const adds = trade.adds ?? {};
  const draftPicks = trade.draft_picks ?? [];

  rosterIds.forEach((rosterId) => {
    const teamName = getTeamName(rosterId);
    const roster = rosters.find((r) => r.roster_id === rosterId);
    const record = roster
      ? `${roster.settings.wins}-${roster.settings.losses}`
      : 'N/A';

    context += `\nRoster ID: ${rosterId}\n`;
    context += `${teamName} (${record}):\n`;

    // What this team received
    context += `  Received:\n`;
    const gotPlayers = Object.entries(adds).filter(([, to]) => to === rosterId);
    const gotPicks = draftPicks.filter((p) => p.owner_id === rosterId);
    if (gotPlayers.length === 0 && gotPicks.length === 0) {
      context += `    - Nothing\n`;
    }
    gotPlayers.forEach(([playerId]) => {
      context += `    - ${resolvePlayerName(playerId)}\n`;
    });
    gotPicks.forEach((pick) => {
      const originalTeam = getTeamName(pick.roster_id);
      context += `    - ${pick.season} Round ${pick.round} Pick (originally ${originalTeam}'s)\n`;
    });

    // What this team gave up
    context += `  Gave up:\n`;
    const sentPlayers = Object.entries(adds).filter(
      ([, to]) => to !== rosterId && rosterIds.includes(to),
    );
    const sentPicks = draftPicks.filter(
      (p) => p.previous_owner_id === rosterId,
    );
    if (sentPlayers.length === 0 && sentPicks.length === 0) {
      context += `    - Nothing\n`;
    }
    sentPlayers.forEach(([playerId]) => {
      context += `    - ${resolvePlayerName(playerId)}\n`;
    });
    sentPicks.forEach((pick) => {
      context += `    - ${pick.season} Round ${pick.round} Pick\n`;
    });
  });

  return context;
}

/**
 * Generate AI analysis for a trade using Claude
 */
export async function generateTradeAnalysis(
  trade: SleeperTransaction,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerNames: Record<string, { name: string; position: string }>,
  apiKey: string,
): Promise<TradeAnalysis> {
  const anthropic = new Anthropic({ apiKey });

  const context = buildTradeContext(trade, rosters, users, playerNames);

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

IMPORTANT: Key the "teams" object by roster ID (as a string), not team name. For example:
{
  "teams": {
    "1": {
      "teamName": "Olde Bowl",
      "grade": "A-",
      ...
    },
    "2": {
      "teamName": "The Champs",
      "grade": "B+",
      ...
    }
  }
}`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system:
      'You are a fantasy football analyst who provides entertaining, snarky trade analysis.',
    tools: [
      {
        name: 'submit_trade_analysis',
        description: 'Submit the structured trade analysis',
        input_schema: ANALYSIS_SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_trade_analysis' },
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const toolUseBlock = response.content.find(
    (block) => block.type === 'tool_use',
  );
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('No tool use block in Claude response');
  }

  const analysis = toolUseBlock.input as TradeAnalysis;
  return analysis;
}
