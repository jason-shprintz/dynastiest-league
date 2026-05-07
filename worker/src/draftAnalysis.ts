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
  // years_exp === 0 in Sleeper indicates a rookie. Surface this affirmatively
  // rather than as "0 yrs exp" so the model parses it correctly.
  const rookieFlag = playerInfo?.years_exp === 0
    ? 'Rookie (no NFL snaps yet)'
    : playerInfo?.years_exp !== undefined
    ? `${playerInfo.years_exp} NFL years`
    : null;

  // NOTE: We intentionally do NOT include Sleeper's search_rank here. It is a
  // global redraft-style ranking that places unproven rookies in the 200+ range
  // because they're not useful in same-season redraft formats. Comparing
  // search_rank against rookie-draft slot numbers (1–40) produced bogus "reach"
  // labels for every pick. Until proper dynasty rookie ADP is wired in (see
  // FantasyCalc integration issue), it's better to omit ADP context entirely
  // and let the model lean on NFL Draft capital, landing spot, and fit.

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
  if (age || rookieFlag) {
    context += `Profile: ${[age, rookieFlag].filter(Boolean).join(', ')}\n`;
  }
  context += `Drafted By: ${teamName} (Roster ID: ${pick.roster_id})\n`;
  if (shapeParts) {
    context += `${teamName}'s current roster: ${shapeParts}\n`;
  }
  if (teamPriorPicks.length > 0) {
    context += `${teamName}'s prior picks in this draft: ${teamPriorPositions}\n`;
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

  const prompt = `You are analyzing a pick in a DYNASTY ROOKIE DRAFT. Provide a brief, entertaining hot take as a short conversation between two analysts, Mike and Jim.

CRITICAL CONTEXT — read carefully before judging this pick:
- Every player taken in this draft is an incoming NFL rookie who has NOT played a single professional snap.
- Traditional/redraft ADP does NOT apply here. Rookies always rank low in redraft formats because they're unproven; that is irrelevant in a dynasty rookie draft.
- Evaluate the pick using:
  • NFL Draft capital (what round/team the player was selected by in the actual NFL Draft)
  • Landing spot and depth chart opportunity
  • Age and athletic profile
  • Positional scarcity in dynasty (elite WRs are scarcer than RBs; QBs gain value in superflex)
  • Fit with the drafting team's existing roster
- Do NOT call this pick a "reach" unless the player would clearly go multiple rounds later in any reasonable dynasty rookie ranking. When uncertain, treat it as fair value.

Pick Details:
${context}

Instructions:
1. Give this pick a letter grade (A+, A, A-, B+, B, B-, C+, C, C-, D+, D, F)
2. Set value_vs_adp as a small integer string. Default to "0" (fair value). Use a small positive number (1–3) only if you're confident the player is widely viewed as a clearly better pick than this slot, and a small negative (-1 to -3) only if clearly a reach. Do NOT use large magnitudes — this is a 4-round, 40-pick draft.
3. Write 2-3 short, punchy exchanges between Mike and Jim
4. Write a one-sentence hot_take

Keep it snarky, quick, and dynasty-rookie-focused.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: 'You are a fantasy football analyst providing quick, snarky takes on dynasty rookie draft picks. You understand that rookies have no NFL track record yet and that traditional redraft ADP is meaningless in a rookie-only dynasty draft.',
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
  context += `\nDraft picks (all rookies):\n`;

  for (const pick of teamPicks) {
    const meta = pick.metadata ?? {};
    const playerName = meta.first_name && meta.last_name
      ? `${meta.first_name} ${meta.last_name}`
      : `Player ID ${pick.player_id}`;
    const position = meta.position ?? 'Unknown';
    const nflTeam = meta.team ?? 'FA';
    const playerInfo = playerMap[pick.player_id];
    const age = playerInfo?.age !== undefined ? `, age ${playerInfo.age}` : '';
    // Intentionally omitting Sleeper search_rank — see note in buildPickContext.
    context += `  Pick #${pick.pick_no} (Rd ${pick.round}): ${playerName} — ${position}, ${nflTeam}${age}\n`;
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

  const prompt = `You are grading a DYNASTY ROOKIE DRAFT class for one team. Give an overall draft grade and a short Mike & Jim conversation.

CRITICAL CONTEXT:
- Every pick below is an incoming NFL rookie. None has played a pro snap.
- Do NOT apply traditional/redraft ADP. Rookies always rank low in redraft; that is irrelevant in a rookie-only dynasty draft.
- Grade based on: NFL Draft capital, landing spot, age/athletic profile, positional scarcity in dynasty, and how the new picks fit with the team's existing roster shape.

${context}

Instructions:
1. Give an overall letter grade for this team's rookie draft class
2. Call out the best pick and worst pick (by pick_no) with a one-sentence reason each. If the team only had great picks, pick the weakest of the strong; if all picks were poor, pick the least bad.
3. Write a 2-3 sentence summary of the draft class
4. Write 2-3 exchanges between Mike and Jim about this draft`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: 'You are a fantasy football analyst grading dynasty rookie draft classes. You understand that rookies have no NFL track record yet and that redraft ADP does not apply.',
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
