import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

// ─── Section layout ───────────────────────────────────────────────────────────

export const DraftSection = styled.section`
  animation: fadeIn 0.5s ease-in;

  h2 {
    font-size: 2.5rem;
    color: ${COLORS.accent};
    margin-bottom: 0.5rem;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }
`;

export const SectionDescription = styled.p`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const LoadingMessage = styled.div`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  padding: 2rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  padding: 3rem;
  background: rgba(15, 52, 96, 0.3);
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 600px;
`;

// ─── Final Grades panel ───────────────────────────────────────────────────────

export const FinalGradesPanel = styled.div`
  margin-bottom: 2.5rem;
`;

export const FinalGradesTitle = styled.h3`
  font-size: 1.5rem;
  color: ${COLORS.accent};
  margin-bottom: 1rem;
  text-align: center;
`;

export const GradesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
`;

// ─── Draft board ─────────────────────────────────────────────────────────────

export const BoardWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 12px;
`;

export const BoardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
`;

export const BoardThead = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
`;

export const BoardTh = styled.th`
  padding: 0.6rem 0.5rem;
  background: ${COLORS.secondary};
  color: ${COLORS.accent};
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid rgba(255, 215, 0, 0.15);

  &:first-child {
    min-width: 60px;
  }
`;

export const RoundLabel = styled.td`
  padding: 0.6rem 0.5rem;
  background: ${COLORS.secondary};
  color: ${COLORS.accent};
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
  white-space: nowrap;
  border: 1px solid rgba(255, 215, 0, 0.15);
`;

export const BoardTd = styled.td`
  vertical-align: top;
  padding: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 140px;
`;

// ─── Pick card ───────────────────────────────────────────────────────────────

export const PickCardContainer = styled.div<{ $hasAnalysis: boolean }>`
  background: ${({ $hasAnalysis }) =>
    $hasAnalysis ? 'rgba(15, 52, 96, 0.45)' : 'rgba(15, 52, 96, 0.2)'};
  border-radius: 8px;
  padding: 0.6rem;
  height: 100%;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(15, 52, 96, 0.6);
  }
`;

export const PickNumber = styled.div`
  font-size: 0.7rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.25rem;
`;

export const PlayerName = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${COLORS.textPrimary};
  margin-bottom: 0.15rem;
`;

export const PlayerMeta = styled.div`
  font-size: 0.75rem;
  color: ${COLORS.textMuted};
  margin-bottom: 0.4rem;
`;

export const GradePill = styled.span<{ $grade: string }>`
  display: inline-block;
  padding: 0.1rem 0.45rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  background: ${({ $grade }) => gradeColor($grade)};
  color: ${COLORS.background};
  margin-right: 0.3rem;
`;

export const ValueBadge = styled.span<{ $delta: number }>`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ $delta }) =>
    $delta > 0 ? COLORS.success : $delta < 0 ? '#f44336' : COLORS.textMuted};
`;

export const HotTake = styled.div`
  font-size: 0.75rem;
  font-style: italic;
  color: ${COLORS.textSecondary};
  margin-top: 0.35rem;
  line-height: 1.4;
`;

export const PlaceholderText = styled.div`
  font-size: 0.75rem;
  font-style: italic;
  color: ${COLORS.textMuted};
  padding: 0.5rem 0;
`;

export const MiniConversation = styled.div`
  margin-top: 0.5rem;
  border-top: 1px solid rgba(168, 178, 209, 0.15);
  padding-top: 0.4rem;
`;

// ─── Team grade card ──────────────────────────────────────────────────────────

export const TeamGradeCardContainer = styled.div`
  background: rgba(15, 52, 96, 0.35);
  border-radius: 12px;
  padding: 1rem;
  border-left: 4px solid ${COLORS.accent};
`;

export const TeamGradeHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

export const TeamGradeName = styled.h4`
  color: ${COLORS.textPrimary};
  font-size: 1rem;
  margin: 0;
`;

export const OverallGradePill = styled.span<{ $grade: string }>`
  padding: 0.2rem 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 700;
  background: ${({ $grade }) => gradeColor($grade)};
  color: ${COLORS.background};
`;

export const GradeSummary = styled.p`
  font-size: 0.875rem;
  color: ${COLORS.textSecondary};
  margin: 0 0 0.6rem 0;
  line-height: 1.5;
`;

export const BestWorstRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
`;

export const BestWorstItem = styled.div<{ $isBest: boolean }>`
  flex: 1;
  min-width: 120px;
  font-size: 0.78rem;
  color: ${({ $isBest }) => ($isBest ? COLORS.success : '#f44336')};

  span {
    font-weight: 700;
  }
`;

export const GradeConversation = styled.div`
  border-top: 1px solid rgba(168, 178, 209, 0.15);
  padding-top: 0.5rem;
  margin-top: 0.5rem;
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gradeColor(grade: string): string {
  const g = grade.toUpperCase();
  if (g.startsWith('A')) return '#4caf50';
  if (g.startsWith('B')) return '#8bc34a';
  if (g.startsWith('C')) return '#ffd700';
  if (g.startsWith('D')) return '#ff9800';
  return '#f44336';
}
