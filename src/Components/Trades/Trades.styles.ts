import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const TradesSection = styled.section`
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

export const TradesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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

export const LoadMoreButton = styled.button`
  margin: 2rem auto;
  padding: 0.75rem 2rem;
  background: ${COLORS.accent};
  color: ${COLORS.background};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;

  &:hover {
    background: ${COLORS.accentHover};
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.accent};
    outline-offset: 4px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.65rem 1.5rem;
  }
`;
