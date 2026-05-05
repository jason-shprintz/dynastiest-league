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
  GradePill,
  ValueBadge,
  HotTake,
  PlaceholderText,
  MiniConversation,
  MiniMessage,
  MiniSpeaker,
  MiniAvatar,
} from './Draft.styles';

interface DraftPickCardProps {
  pick: DraftPick;
  analysis: DraftPickAnalysis | null | undefined;
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

export const DraftPickCard = ({ pick, analysis }: DraftPickCardProps) => {
  const meta = pick.metadata ?? {};
  const firstName = meta.first_name ?? '';
  const lastName = meta.last_name ?? '';
  const playerName = firstName || lastName ? `${firstName} ${lastName}`.trim() : `ID: ${pick.player_id}`;
  const position = meta.position ?? '?';
  const nflTeam = meta.team ?? 'FA';

  return (
    <PickCardContainer $hasAnalysis={!!analysis}>
      <PickNumber>
        #{pick.pick_no} · Rd {pick.round}
      </PickNumber>
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
              {analysis.conversation.slice(0, 3).map((msg, i) => (
                <MiniMessage key={i}>
                  <MiniAvatar
                    src={msg.speaker === 'Mike' ? '/MikeFantasy.webp' : '/JimFantasy.webp'}
                    alt={msg.speaker}
                  />
                  <div>
                    <MiniSpeaker $isMike={msg.speaker === 'Mike'}>{msg.speaker}: </MiniSpeaker>
                    {msg.text}
                  </div>
                </MiniMessage>
              ))}
            </MiniConversation>
          )}
        </>
      ) : (
        <PlaceholderText>Mike &amp; Jim are watching the highlights...</PlaceholderText>
      )}
    </PickCardContainer>
  );
};
