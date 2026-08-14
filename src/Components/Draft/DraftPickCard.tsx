/**
 * DraftPickCard
 * Displays a single draft pick cell in the board: player info + AI analysis
 */

import type { DraftPick } from '../../types/sleeper';
import type { DraftPickAnalysis } from '../../stores/DraftPickAnalysisStore';
import {
  PickCardContainer,
  PickNumber,
  PlayerName,
  PlayerMeta,
  PickTeamName,
  GradePill,
  ValueBadge,
  HotTake,
  PlaceholderText,
  MiniConversation,
} from './Draft.styles';
import { Conversation } from '../shared/Conversation';
import { MIKE_AND_JIM_SPEAKERS } from '../shared/speakers';

interface DraftPickCardProps {
  pick: DraftPick;
  analysis: DraftPickAnalysis | null | undefined;
  teamName: string;
}

function parseValueDelta(valueVsAdp: string): number {
  const n = parseInt(valueVsAdp, 10);
  return isNaN(n) ? 0 : n;
}

function formatValueLabel(valueVsAdp: string): string {
  const delta = parseValueDelta(valueVsAdp);
  if (delta > 0) return `+${delta} value`;
  if (delta < 0) return `${delta} reach`;
  return 'fair value';
}

export const DraftPickCard = ({
  pick,
  analysis,
  teamName,
}: DraftPickCardProps) => {
  const meta = pick.metadata ?? {};
  const firstName = meta.first_name ?? '';
  const lastName = meta.last_name ?? '';
  const playerName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : `ID: ${pick.player_id}`;
  const position = meta.position ?? '?';
  const nflTeam = meta.team ?? 'FA';

  return (
    <PickCardContainer $hasAnalysis={!!analysis}>
      <PickNumber>
        #{pick.pick_no} · Rd {pick.round}
      </PickNumber>
      <PickTeamName>{teamName}</PickTeamName>
      <PlayerName>{playerName}</PlayerName>
      <PlayerMeta>
        {position} · {nflTeam}
      </PlayerMeta>

      {analysis ? (
        <>
          <div>
            <GradePill $grade={analysis.grade}>{analysis.grade}</GradePill>
            <ValueBadge $delta={parseValueDelta(analysis.value_vs_adp)}>
              {formatValueLabel(analysis.value_vs_adp)}
            </ValueBadge>
          </div>
          <HotTake>"{analysis.hot_take}"</HotTake>
          {analysis.conversation.length > 0 && (
            <MiniConversation>
              <Conversation
                messages={analysis.conversation.slice(0, 3)}
                speakers={MIKE_AND_JIM_SPEAKERS}
                variant="compact"
              />
            </MiniConversation>
          )}
        </>
      ) : (
        <PlaceholderText>
          Mike &amp; Jim are watching the highlights...
        </PlaceholderText>
      )}
    </PickCardContainer>
  );
};
