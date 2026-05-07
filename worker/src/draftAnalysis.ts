/**
 * Draft AI Analysis (Anthropic Claude)
 * Generates per-pick analysis and per-team overall draft grades
 */

import Anthropic from '@anthropic-ai/sdk';
import type {
  SleeperDraftPick,
  SleeperRoster,
  SleeperUser,
  PlayerInfo,
  DraftPickAnalysis,
  TeamDraftGrade,
} from './types';
import type { RookieValueMap } from './rookieValues';

// ─── Per-pick analysis ────────────────────────────────────────────────────────

const PICK_ANALYSIS_SCHEMA = {
  type: 'object' as const,
  properties: {
    grade: { type: 'string' },
    value_vs_adp: { type: 'string' },
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
    hot_take: { type: 'string' },
  },
  required: ['grade', 'value_vs_adp', 'conversation', 'hot_take'],
};

function getTeamName(
  rosterId: number,
  rosters: SleeperRoster[],
  users: SleeperUser[],
): string {
  const roster = rosters.find((r) => r.roster_id === rosterId);
  if (!roster) return `Team ${rosterId}`;
  const user = users.find((u) => u.user_id === roster.owner_id);
  if (!user) return `Team ${rosterId}`;
  return user.metadata?.team_name || user.display_name || user.username;
}

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
 * Bucket the slot-vs-rank delta into a qualitative label for the prompt.
 * Positive delta = picked LATER than expected = good value for drafter.
 * Negative delta = picked EARLIER than expected = reach.
 */
function deltaLabel(delta: number): string {
  if (delta >= 8) return 'major value — fell well below consensus';
  if (delta >= 4) return 'good value — fell below consensus';
  if (delta >= 2) return 'slight value';
  if (delta >= -1) return 'roughly at consensus';
  if (delta >= -3) return 'slight reach';
  if (delta >= -7) return 'reach — taken meaningfully early';
  return 'major reach — taken well above consensus';
}

interface PickContextResult {
  context: string;
  /** Slot - overallRank. null when no FantasyCalc data is available. */
  computedDelta: number | null;
}

function buildPickContext(
  pick: SleeperDraftPick,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
  priorPicks: SleeperDraftPick[],
  rookieValues: RookieValueMap,
): PickContextResult {
  const meta = pick.metadata ?? {};
  const playerName = meta.first_name && meta.last_name
    ? `${meta.first_name} ${meta.last_name}`
    : `Player ID ${pick.player_id}`;
  const position = meta.position ?? 'Unknown';
  const nflTeam = meta.team ?? 'Free Agent';

  const playerInfo = playerMap[pick.player_id];
  const age = playerInfo?.age !== undefined ? `Age ${playerInfo.age}` : null;
  const rookieFlag = playerInfo?.years_exp === 0
    ? 'Rookie (no NFL snaps yet)'
    : playerInfo?.years_exp !== undefined
    ? `${playerInfo.years_exp} NFL years`
    : null;

  const teamName = getTeamName(pick.roster_id, rosters, users);
  const roster = rosters.find((r) => r.roster_id === pick.roster_id);
  const rosterShape = roster
    ? computeRosterShape(roster.players ?? [], playerMap)
    : {};

  const shapeParts = Object.entries(rosterShape)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pos, cnt]) => `${pos}: ${cnt}`)
    .join(', ');

  const teamPriorPicks = priorPicks.filter((p) => p.roster_id === pick.roster_id);
  const teamPriorPositions = teamPriorPicks
    .map((p) => p.metadata?.position ?? '?')
    .join(', ');

  // FantasyCalc dynasty value (the authoritative ADP signal for rookies).
  // The dynasty value already implicitly bakes in NFL Draft capital, landing
  // spot, and athletic profile — exactly the signals the model is missing
  // due to its training cutoff predating the actual NFL Draft.
  const fcValue = rookieValues.players[pick.player_id];
  let computedDelta: number | null = null;
  let valueLine = '';
  if (fcValue) {
    computedDelta = pick.pick_no - fcValue.overallRank;
    const deltaSign = computedDelta > 0 ? '+' : '';
    valueLine =
      `Dynasty rank (FantasyCalc): #${fcValue.overallRank} overall, #${fcValue.positionRank} at ${position} (value ${fcValue.value})\n` +
      `Slot vs rank: picked at #${pick.pick_no}, ranked #${fcValue.overallRank} → delta ${deltaSign}${computedDelta} (${deltaLabel(computedDelta)})\n`;
  } else {
    valueLine =
      `Dynasty rank: not in FantasyCalc database (likely a deeper prospect or late riser). Do not speculate about value; comment on player profile and team fit instead.\n`;
  }

  let context = `Pick #${pick.pick_no} (Round ${pick.round})\n`;
  context += `Player: ${playerName} | Position: ${position} | NFL Team: ${nflTeam}\n`;
  if (age || rookieFlag) {
    context += `Profile: ${[age, rookieFlag].filter(Boolean).join(', ')}\n`;
  }
  context += valueLine;
  context += `Drafted By: ${teamName}\n`;
  if (shapeParts) {
    context += `${teamName}'s current roster shape: ${shapeParts}\n`;
  }
  if (teamPriorPicks.length > 0) {
    context += `${teamName}'s prior picks in this draft: ${teamPriorPositions}\n`;
  }
  return { context, computedDelta };
}

/**
 * Generate AI analysis for a single draft pick
 */
export async function generatePickAnalysis(
  pick: SleeperDraftPick,
  draftId: string,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
  priorPicks: SleeperDraftPick[],
  rookieValues: RookieValueMap,
  apiKey: string,
): Promise<DraftPickAnalysis> {
  const anthropic = new Anthropic({ apiKey });

  const { context, computedDelta } = buildPickContext(
    pick,
    rosters,
    users,
    playerMap,
    priorPicks,
    rookieValues,
  );

  const prompt = `You are Mike and Jim, two fantasy football analysts giving a quick take on a dynasty rookie draft pick.

Context:
- This is a 4-round, 40-pick dynasty rookie draft. Every player is an incoming NFL rookie.
- The pick details below include the player's dynasty rank from FantasyCalc, which represents the consensus dynasty community valuation. Treat this as the authoritative source for whether the pick was made at a fair slot.
- "Slot vs rank" tells you exactly whether the pick was good value, fair, or a reach. Use that as your starting point — do not invent your own ADP intuitions.
- If a player has no FantasyCalc rank, do NOT speculate about value. Focus only on player profile and team fit.

What to discuss:
- Whether the pick was good value, fair, or a reach (per the delta)
- Player profile and fit with the drafting team's roster shape
- Positional dynasty appeal (elite WRs scarce, RBs age fast, QBs matter more in superflex)
- Snark and entertainment

Pick details:
${context}

Instructions:
1. Letter grade (A+ through F) reflecting both player quality and slot value.
2. value_vs_adp: short integer-string. Use the slot-vs-rank delta directly when available, "0" when no FantasyCalc data.
3. 2–3 short, punchy Mike & Jim exchanges.
4. One-sentence hot_take.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: 'You are Mike and Jim, dynasty fantasy football analysts. You evaluate rookie draft picks using FantasyCalc dynasty rankings as the authoritative consensus, supplemented by player profile and roster fit.',
    tools: [
      {
        name: 'submit_pick_analysis',
        description: 'Submit the structured draft pick analysis',
        input_schema: PICK_ANALYSIS_SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_pick_analysis' },
    messages: [{ role: 'user', content: prompt }],
  });

  const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('No tool use block in Claude response for pick analysis');
  }

  const analysis = toolUseBlock.input as Omit<DraftPickAnalysis, 'pick_id' | 'draft_id' | 'pick_no'>;

  // Always overwrite value_vs_adp with the computed delta (or "0" when we
  // have no FantasyCalc data). The model's emitted value is unreliable; the
  // delta is deterministic and matches the prompt context exactly.
  const sanitizedValue = computedDelta !== null ? String(computedDelta) : '0';

  return {
    ...analysis,
    value_vs_adp: sanitizedValue,
    pick_id: `${draftId}:${pick.pick_no}`,
    draft_id: draftId,
    pick_no: pick.pick_no,
  };
}

// ─── Per-team overall grade ───────────────────────────────────────────────────

const TEAM_GRADE_SCHEMA = {
  type: 'object' as const,
  properties: {
    overall_grade: { type: 'string' },
    best_pick: {
      type: 'object',
      properties: {
        pick_no: { type: 'number' },
        reason: { type: 'string' },
      },
      required: ['pick_no', 'reason'],
    },
    worst_pick: {
      type: 'object',
      properties: {
        pick_no: { type: 'number' },
        reason: { type: 'string' },
      },
      required: ['pick_no', 'reason'],
    },
    summary: { type: 'string' },
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
  },
  required: ['overall_grade', 'summary', 'conversation'],
};

function buildTeamGradeContext(
  rosterId: number,
  teamPicks: SleeperDraftPick[],
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
  rookieValues: RookieValueMap,
): string {
  const teamName = getTeamName(rosterId, rosters, users);
  const roster = rosters.find((r) => r.roster_id === rosterId);
  const rosterShape = roster
    ? computeRosterShape(roster.players ?? [], playerMap)
    : {};

  const shapeParts = Object.entries(rosterShape)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pos, cnt]) => `${pos}: ${cnt}`)
    .join(', ');

  let totalValue = 0;
  let totalSlotDelta = 0;
  let picksWithValue = 0;

  let context = `Team: ${teamName}\n`;
  if (shapeParts) {
    context += `Existing roster shape: ${shapeParts}\n`;
  }
  context += `\nDraft picks (all incoming NFL rookies):\n`;

  for (const pick of teamPicks) {
    const meta = pick.metadata ?? {};
    const playerName = meta.first_name && meta.last_name
      ? `${meta.first_name} ${meta.last_name}`
      : `Player ID ${pick.player_id}`;
    const position = meta.position ?? 'Unknown';
    const nflTeam = meta.team ?? 'FA';
    const playerInfo = playerMap[pick.player_id];
    const age = playerInfo?.age !== undefined ? `, age ${playerInfo.age}` : '';

    const fcValue = rookieValues.players[pick.player_id];
    let valueSegment = '';
    if (fcValue) {
      const delta = pick.pick_no - fcValue.overallRank;
      const deltaSign = delta > 0 ? '+' : '';
      valueSegment = ` | Dynasty #${fcValue.overallRank} overall (delta ${deltaSign}${delta}: ${deltaLabel(delta)})`;
      totalValue += fcValue.value;
      totalSlotDelta += delta;
      picksWithValue++;
    } else {
      valueSegment = ' | Dynasty rank: not in FantasyCalc';
    }

    context += `  Pick #${pick.pick_no} (Rd ${pick.round}): ${playerName} — ${position}, ${nflTeam}${age}${valueSegment}\n`;
  }

  if (picksWithValue > 0) {
    const avgDelta = totalSlotDelta / picksWithValue;
    const avgSign = avgDelta > 0 ? '+' : '';
    context += `\nClass totals (FantasyCalc-rated picks only): total value ${totalValue}, average slot-vs-rank delta ${avgSign}${avgDelta.toFixed(1)}\n`;
  }

  return context;
}

/**
 * Generate overall draft grade for a single team
 */
export async function generateTeamDraftGrade(
  rosterId: number,
  draftId: string,
  teamPicks: SleeperDraftPick[],
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
  rookieValues: RookieValueMap,
  apiKey: string,
): Promise<TeamDraftGrade> {
  const anthropic = new Anthropic({ apiKey });

  const context = buildTeamGradeContext(
    rosterId,
    teamPicks,
    rosters,
    users,
    playerMap,
    rookieValues,
  );

  const prompt = `You are Mike and Jim grading one team's dynasty rookie draft class.

Context:
- This is a dynasty rookie draft. All picks below are incoming NFL rookies.
- Each pick includes the player's FantasyCalc dynasty rank — the consensus dynasty community valuation. Use this as the authoritative source for whether picks were made at fair slots.
- "Class totals" tells you the team's average slot-vs-rank delta. Positive average = team consistently got value. Negative average = team consistently reached.

Grade based on:
- Total dynasty value accumulated (sum of FantasyCalc values)
- How well the rookies fill positional needs in the existing roster
- Whether the team got value at each slot or reached
- Positional dynasty appeal of the class (WRs and TEs age slowly; RBs are volatile)

${context}

Instructions:
1. Letter grade for the rookie class.
2. Best pick + worst pick (by pick_no) with one-sentence reason each (cite the dynasty rank when relevant).
3. 2–3 sentence summary of the class.
4. 2–3 exchanges between Mike and Jim about the team's strategy and execution.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: 'You are Mike and Jim, dynasty fantasy football analysts. You grade rookie draft classes using FantasyCalc dynasty rankings as the authoritative consensus, total class value, slot-vs-rank deltas, and roster fit.',
    tools: [
      {
        name: 'submit_team_grade',
        description: 'Submit the structured team draft grade',
        input_schema: TEAM_GRADE_SCHEMA,
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_team_grade' },
    messages: [{ role: 'user', content: prompt }],
  });

  const toolUseBlock = response.content.find((block) => block.type === 'tool_use');
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    throw new Error('No tool use block in Claude response for team grade');
  }

  const gradeOutput = toolUseBlock.input as Omit<TeamDraftGrade, 'draft_id' | 'roster_id'>;
  return {
    ...gradeOutput,
    draft_id: draftId,
    roster_id: rosterId,
    best_pick: gradeOutput.best_pick ?? null,
    worst_pick: gradeOutput.worst_pick ?? null,
  };
}
