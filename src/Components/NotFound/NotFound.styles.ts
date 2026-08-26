import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

export const NotFoundSection = styled.section`
  animation: fadeIn 0.5s ease-in;
  max-width: 640px;
  margin: 0 auto;
  padding: 3rem 0;
  text-align: center;

  h2 {
    font-size: 2.5rem;
    color: ${COLORS.accent};
    margin-bottom: 0.5rem;

    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }
`;

export const StatusCode = styled.p`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 4rem;
  line-height: 1;
  color: ${COLORS.accent};
  opacity: 0.35;
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 3rem;
  }
`;

export const Explanation = styled.p`
  color: ${COLORS.textSecondary};
  font-size: 1.05rem;
  line-height: 1.7;
  margin-bottom: 0.75rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const RequestedPath = styled.code`
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.9rem;
  color: ${COLORS.textMuted};
  background: rgba(15, 52, 96, 0.5);
  border-radius: 6px;
  padding: 0.2rem 0.45rem;
`;

export const SuggestionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 2rem 0 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
`;

export const SuggestionButton = styled.button`
  background: rgba(15, 52, 96, 0.3);
  color: ${COLORS.textSecondary};
  border: 1px solid ${COLORS.secondary};
  border-radius: 8px;
  padding: 0.6rem 1.1rem;
  font-size: 0.95rem;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    background: rgba(15, 52, 96, 0.6);
    color: ${COLORS.accent};
    border-color: ${COLORS.accent};
  }
`;
