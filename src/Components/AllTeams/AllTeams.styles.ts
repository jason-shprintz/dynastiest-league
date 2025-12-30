import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const TeamsSection = styled.section`
  animation: fadeIn 0.5s ease-in;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const TeamsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const TeamCard = styled.div<{ $isExpanded: boolean }>`
  background: rgba(15, 52, 96, 0.4);
  border: 2px solid ${(props) => (props.$isExpanded ? COLORS.accent : "rgba(255, 215, 0, 0.3)")};
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.$isExpanded
      ? "0 8px 24px rgba(255, 215, 0, 0.3)"
      : "0 4px 12px rgba(0, 0, 0, 0.2)"};

  &:hover {
    border-color: ${COLORS.accent};
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

export const TeamSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

export const TeamAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${COLORS.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }
`;

export const TeamInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TeamName = styled.h3`
  font-size: 1.3rem;
  color: ${COLORS.accent};
  margin: 0 0 0.25rem 0;
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

export const UserName = styled.p`
  font-size: 1rem;
  color: ${COLORS.textMuted};
  margin: 0 0 0.25rem 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

export const TeamRecord = styled.p`
  font-size: 1.1rem;
  color: ${COLORS.textSecondary};
  margin: 0;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const TeamDetails = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const RosterSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const RosterSectionTitle = styled.h4`
  font-size: 1rem;
  color: ${COLORS.accent};
  margin: 0 0 0.75rem 0;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const PlayersList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const PlayerChip = styled.span`
  background: rgba(0, 0, 0, 0.3);
  color: ${COLORS.textSecondary};
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  border: 1px solid rgba(168, 178, 209, 0.2);

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.4rem 0.6rem;
  }
`;

export const EmptyState = styled.p`
  color: ${COLORS.textMuted};
  font-style: italic;
  margin: 0;
`;

export const LoadingMessage = styled.p`
  color: ${COLORS.textSecondary};
  text-align: center;
  font-size: 1.1rem;
  padding: 2rem;
`;

export const ErrorMessage = styled.p`
  color: #ff6b6b;
  text-align: center;
  font-size: 1.1rem;
  padding: 2rem;
`;
