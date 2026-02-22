/**
 * Quick integration test for the Claude trade analysis.
 * Run with: ANTHROPIC_API_KEY=sk-ant-... node test-analysis.mjs
 */
import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is not set");
  process.exit(1);
}

// Mock trade data — simulates a real Sleeper transaction
const mockTrade = {
  transaction_id: "test-123456",
  type: "trade",
  status: "complete",
  created: Date.now(),
  roster_ids: [1, 3],
  adds: {
    "4046": 1,  // player going to roster 1
    "6794": 3,  // player going to roster 3
  },
  drops: null,
  draft_picks: [
    { season: "2025", round: 1, roster_id: 3, previous_owner_id: 3, owner_id: 1 },
  ],
  metadata: null,
};

// Mock player name map — in production this comes from KV-cached /players/nfl
const mockPlayerNames = {
  "4046": { name: "Justin Jefferson", position: "WR" },
  "6794": { name: "Ja'Marr Chase", position: "WR" },
};

const mockRosters = [
  { roster_id: 1, owner_id: "user1", players: [], settings: { wins: 8, losses: 5, fpts: 1450 } },
  { roster_id: 3, owner_id: "user3", players: [], settings: { wins: 4, losses: 9, fpts: 1100 } },
];

const mockUsers = [
  { user_id: "user1", username: "jshprintz", display_name: "Jason", metadata: { team_name: "Olde' Bowl" } },
  { user_id: "user3", username: "player3",  display_name: "Mike",  metadata: { team_name: "Fish and Gritz" } },
];

// ---- Same logic as worker/src/openai.ts ----

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
          teamName: { type: "string" },
          grade: { type: "string" },
          received: {
            type: "object",
            properties: {
              players: { type: "array", items: { type: "object", properties: { name: { type: "string" }, position: { type: "string" }, team: { type: "string" } }, required: ["name", "position", "team"] } },
              picks:   { type: "array", items: { type: "object", properties: { season: { type: "string" }, round: { type: "number" } }, required: ["season", "round"] } },
            },
            required: ["players", "picks"],
          },
          summary: { type: "string" },
        },
        required: ["teamName", "grade", "received", "summary"],
      },
    },
    conversation: {
      type: "array",
      items: { type: "object", properties: { speaker: { type: "string", enum: ["Mike", "Jim"] }, text: { type: "string" } }, required: ["speaker", "text"] },
    },
    overall_take: { type: "string" },
  },
  required: ["transaction_id", "timestamp", "teams", "conversation", "overall_take"],
};

function buildContext(trade, rosters, users, playerNames) {
  const getName = (rosterId) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const user   = users.find(u => u.user_id === roster?.owner_id);
    return user?.metadata?.team_name || user?.display_name || `Team ${rosterId}`;
  };

  const resolvePlayer = (pid) => {
    if (playerNames[pid]) return `${playerNames[pid].name} (${playerNames[pid].position})`;
    return `Player ID: ${pid}`;
  };

  const adds = trade.adds ?? {};
  const picks = trade.draft_picks ?? [];

  let ctx = `Transaction ID: ${trade.transaction_id}\nDate: ${new Date(trade.created).toLocaleDateString()}\n\nTeams involved:\n`;
  for (const rosterId of trade.roster_ids) {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const record = roster ? `${roster.settings.wins}-${roster.settings.losses}` : "N/A";
    ctx += `\nRoster ID: ${rosterId}\n${getName(rosterId)} (${record}):\n`;

    ctx += `  Received:\n`;
    const gotPlayers = Object.entries(adds).filter(([, to]) => to === rosterId);
    const gotPicks   = picks.filter(p => p.owner_id === rosterId);
    if (!gotPlayers.length && !gotPicks.length) ctx += `    - Nothing\n`;
    gotPlayers.forEach(([pid]) => ctx += `    - ${resolvePlayer(pid)}\n`);
    gotPicks.forEach(p => ctx += `    - ${p.season} Round ${p.round} Pick (originally ${getName(p.roster_id)}'s)\n`);

    ctx += `  Gave up:\n`;
    const sentPlayers = Object.entries(adds).filter(([, to]) => to !== rosterId && trade.roster_ids.includes(to));
    const sentPicks   = picks.filter(p => p.previous_owner_id === rosterId);
    if (!sentPlayers.length && !sentPicks.length) ctx += `    - Nothing\n`;
    sentPlayers.forEach(([pid]) => ctx += `    - ${resolvePlayer(pid)}\n`);
    sentPicks.forEach(p => ctx += `    - ${p.season} Round ${p.round} Pick\n`);
  }
  return ctx;
}

async function run() {
  const anthropic = new Anthropic({ apiKey });
  const context = buildContext(mockTrade, mockRosters, mockUsers, mockPlayerNames);

  console.log("Sending trade to Claude...\n");
  console.log("Trade context:\n" + context);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    system: "You are a fantasy football analyst who provides entertaining, snarky trade analysis.",
    tools: [{ name: "submit_trade_analysis", description: "Submit the structured trade analysis", input_schema: ANALYSIS_SCHEMA }],
    tool_choice: { type: "tool", name: "submit_trade_analysis" },
    messages: [{ role: "user", content: `Analyze this dynasty fantasy football trade:\n\n${context}\n\nKey the "teams" object by roster ID string (e.g. "1", "3").` }],
  });

  const toolUse = response.content.find(b => b.type === "tool_use");
  if (!toolUse) throw new Error("No tool use block in response");

  console.log("\n✅ Analysis generated:\n");
  console.log(JSON.stringify(toolUse.input, null, 2));
}

run().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
