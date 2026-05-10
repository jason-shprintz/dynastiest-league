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
  _rookieValues: RookieValueMap,
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

  // Sleeper search_rank intentionally omitted — see prior commit note.
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

  const computedDelta: number | null = null;
  let context = `Pick #${pick.pick_no} (Round ${pick.round})\n`;
  context += `Player: ${playerName} | Position: ${position} | NFL Team: ${nflTeam}\n`;
  if (age || rookieFlag) {
    context += `Profile: ${[age, rookieFlag].filter(Boolean).join(', ')}\n`;
  }
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
  draftRounds: number,
  draftTeams: number,
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

  // Keep the model focused on player profile and team fit instead of draft-slot
  // timing or market/ranking labels.
  const prompt = `You are Mike and Jim, two fantasy football analysts giving a quick take on a dynasty rookie draft pick.

Important constraints:

(1) Every player taken in this ${draftRounds}-round, ${draftRounds * draftTeams}-pick draft is an incoming NFL rookie with zero professional snaps. This analysis is a player-profile + roster-fit evaluation only.

(2) Stay inside that scope: discuss profile, traits, fit, and dynasty role. Skip market/ranking labels and pick-number timing debates.

(3) What you SHOULD discuss: the player's college profile and skill set, their athletic traits, the position they play and how it slots into the drafting team's roster construction, the general dynasty appeal of the position (e.g. elite WRs are scarce, RBs age fast), and any banter about the player as a prospect. Be entertaining, snarky, and fun.

Pick details:
${context}

Instructions:
1. Letter grade (A+ through F) based on PLAYER PROFILE and ROSTER FIT only — never on whether the slot itself was right or wrong.
2. value_vs_adp: set this to exactly the string "0". You do not have ADP data, so do not assign any other value.
3. 2–3 short, punchy exchanges between Mike and Jim about the player. No slot-timing commentary.
4. One-sentence hot_take about the player's dynasty profile.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 800,
    system: 'You are Mike and Jim, fantasy football analysts evaluating dynasty rookie draft picks. You focus on player profile, athletic traits, and team fit. You never opine on draft-slot timing because you do not have reliable rookie ADP or NFL Draft slot data.',
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

  // Defensive: hard-force this signal to neutral until real rookie ADP is wired.
  const sanitizedValue = '0';

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
  _rookieValues: RookieValueMap,
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

Important constraints:

(1) Every pick below is an incoming NFL rookie with zero professional snaps. Grade this class from player-profile quality and roster-construction fit only.

(2) Keep commentary centered on player traits, positional strategy, and team-building outcomes. Market/ranking labels and pick-timing debates are out of scope.

(3) What you SHOULD evaluate: how the rookie class fills positional needs in the drafting team's roster, the dynasty appeal of the positions targeted (WR-heavy classes age better than RB-heavy ones), the player profiles, and overall roster construction strategy.

${context}

Instructions:
1. Letter grade for the rookie class based on PROFILE FIT and ROSTER CONSTRUCTION.
2. Best pick + worst pick (by pick_no) with a one-sentence reason for each. The reasons must be about the PLAYER and FIT, not slot timing. If picks were comparable, pick the strongest fit vs the weakest fit.
3. 2–3 sentence summary of the class.
4. 2–3 exchanges between Mike and Jim about the team's strategy.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: 'You are Mike and Jim, fantasy football analysts grading dynasty rookie draft classes. You focus on roster construction, positional dynasty appeal, and player profile fit. You never opine on draft-slot timing because you do not have reliable rookie ADP or NFL Draft slot data.',
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
