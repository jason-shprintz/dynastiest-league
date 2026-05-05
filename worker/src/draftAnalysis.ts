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

function buildPickContext(
  pick: SleeperDraftPick,
  draftId: string,
  rosters: SleeperRoster[],
  users: SleeperUser[],
  playerMap: Record<string, PlayerInfo>,
  priorPicks: SleeperDraftPick[],
): string {
  const meta = pick.metadata ?? {};
  const playerName = meta.first_name && meta.last_name
    ? `${meta.first_name} ${meta.last_name}`
    : `Player ID ${pick.player_id}`;
  const position = meta.position ?? 'Unknown';
  const nflTeam = meta.team ?? 'Free Agent';

  const playerInfo = playerMap[pick.player_id];
  const age = playerInfo?.age !== undefined ? `Age ${playerInfo.age}` : null;
  const yearsExp = playerInfo?.years_exp !== undefined
    ? `${playerInfo.years_exp} yrs exp`
    : null;
  const rank = playerInfo?.search_rank !== undefined
    ? `Dynasty rank #${playerInfo.search_rank}`
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

  // Prior picks in this draft for context (has this team been heavy at a position?)
  const teamPriorPicks = priorPicks.filter((p) => p.roster_id === pick.roster_id);
  const teamPriorPositions = teamPriorPicks
    .map((p) => p.metadata?.position ?? '?')
    .join(', ');

  let context = `Draft ID: ${draftId}\n`;
  context += `Pick #${pick.pick_no} (Round ${pick.round})\n`;
  context += `Player: ${playerName} | Position: ${position} | NFL Team: ${nflTeam}\n`;
  if (age || yearsExp || rank) {
    context += `Profile: ${[age, yearsExp, rank].filter(Boolean).join(', ')}\n`;
  }
  context += `Drafted By: ${teamName} (Roster ID: ${pick.roster_id})\n`;
  if (shapeParts) {
    context += `${teamName}'s current roster: ${shapeParts}\n`;
  }
  if (teamPriorPicks.length > 0) {
    context += `${teamName}'s prior picks in this draft: ${teamPriorPositions}\n`;
  }
  if (rank) {
    const expectedSlot = playerInfo!.search_rank!;
    // Positive delta = player fell further than expected = good value for the drafter
    // Negative delta = player taken earlier than ranked = reach
    const delta = pick.pick_no - expectedSlot;
    if (Math.abs(delta) >= 3) {
      context += `Value note: Ranked #${expectedSlot} overall; picked at slot ${pick.pick_no} (${delta > 0 ? `${delta} picks late / good value` : `${Math.abs(delta)} picks early / reach`})\n`;
    }
  }
  return context;
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
  apiKey: string,
): Promise<DraftPickAnalysis> {
  const anthropic = new Anthropic({ apiKey });

  const context = buildPickContext(pick, draftId, rosters, users, playerMap, priorPicks);

  const prompt = `You are analyzing a dynasty fantasy football rookie draft pick. Provide a brief, entertaining hot take as a short conversation between two analysts, Mike and Jim.

Pick Details:
${context}

Instructions:
1. Give this pick a letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F)
2. Rate value vs ADP/ranking: positive number means good value (picked later than expected), negative means reach, "0" means fair value
3. Write 2-3 exchanges between Mike and Jim — short and punchy, not long paragraphs
4. Write a one-sentence hot_take

Keep it snarky, quick, and dynasty-focused.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: 'You are a fantasy football analyst providing quick, snarky takes on rookie draft picks.',
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
  return {
    ...analysis,
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

  let context = `Team: ${teamName} (Roster ID: ${rosterId})\n`;
  if (shapeParts) {
    context += `Existing roster: ${shapeParts}\n`;
  }
  context += `\nDraft picks:\n`;

  for (const pick of teamPicks) {
    const meta = pick.metadata ?? {};
    const playerName = meta.first_name && meta.last_name
      ? `${meta.first_name} ${meta.last_name}`
      : `Player ID ${pick.player_id}`;
    const position = meta.position ?? 'Unknown';
    const nflTeam = meta.team ?? 'FA';
    const playerInfo = playerMap[pick.player_id];
    const rank = playerInfo?.search_rank !== undefined ? ` (rank #${playerInfo.search_rank})` : '';
    const age = playerInfo?.age !== undefined ? `, age ${playerInfo.age}` : '';
    context += `  Pick #${pick.pick_no} (Rd ${pick.round}): ${playerName} — ${position}, ${nflTeam}${age}${rank}\n`;
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
  apiKey: string,
): Promise<TeamDraftGrade> {
  const anthropic = new Anthropic({ apiKey });

  const context = buildTeamGradeContext(rosterId, teamPicks, rosters, users, playerMap);

  const prompt = `You are grading an entire dynasty rookie draft class for one team. Give an overall draft grade and a short Mike & Jim conversation.

${context}

Instructions:
1. Give an overall letter grade for this team's draft class
2. Call out the best pick and worst pick (by pick_no) with a one-sentence reason each. If the team only had great picks, pick the weakest of the strong; if all picks were poor, pick the least bad.
3. Write a 2-3 sentence summary of the draft class
4. Write 2-3 exchanges between Mike and Jim about this draft

Dynasty context matters: age, position scarcity, and fit with existing roster.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: 'You are a fantasy football analyst grading dynasty rookie draft classes.',
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
