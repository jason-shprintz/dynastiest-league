/**
 * TeamDraftGradeCard
 * Displays overall draft grade for a single team
 */

import type { TeamDraftGrade } from '../../stores/TeamDraftGradeStore';
import {
  TeamGradeCardContainer,
  TeamGradeHeader,
  TeamGradeName,
  OverallGradePill,
  GradeSummary,
  BestWorstRow,
  BestWorstItem,
  GradeConversation,
  GradeMessageRow,
  GradeAvatar,
  GradeSpeaker,
} from './Draft.styles';

interface TeamDraftGradeCardProps {
  grade: TeamDraftGrade;
  teamName: string;
}

export const TeamDraftGradeCard = ({ grade, teamName }: TeamDraftGradeCardProps) => {
  return (
    <TeamGradeCardContainer>
      <TeamGradeHeader>
        <TeamGradeName>{teamName}</TeamGradeName>
        <OverallGradePill $grade={grade.overall_grade}>{grade.overall_grade}</OverallGradePill>
      </TeamGradeHeader>

      <GradeSummary>{grade.summary}</GradeSummary>

      {(grade.best_pick || grade.worst_pick) && (
        <BestWorstRow>
          {grade.best_pick && (
            <BestWorstItem $isBest={true}>
              🏆 <span>Best:</span> Pick #{grade.best_pick.pick_no} — {grade.best_pick.reason}
            </BestWorstItem>
          )}
          {grade.worst_pick && (
            <BestWorstItem $isBest={false}>
              📉 <span>Worst:</span> Pick #{grade.worst_pick.pick_no} — {grade.worst_pick.reason}
            </BestWorstItem>
          )}
        </BestWorstRow>
      )}

      {grade.conversation.length > 0 && (
        <GradeConversation>
          {grade.conversation.map((msg, i) => (
            <GradeMessageRow key={i}>
              <GradeAvatar
                src={msg.speaker === 'Mike' ? '/MikeFantasy.webp' : '/JimFantasy.webp'}
                alt={msg.speaker}
              />
              <div>
                <GradeSpeaker $isMike={msg.speaker === 'Mike'}>{msg.speaker}: </GradeSpeaker>
                {msg.text}
              </div>
            </GradeMessageRow>
          ))}
        </GradeConversation>
      )}
    </TeamGradeCardContainer>
  );
};
