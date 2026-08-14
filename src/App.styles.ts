import styled from 'styled-components';
import { COLORS } from './theme/colors';

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(
    135deg,
    ${COLORS.background} 0%,
    ${COLORS.backgroundGradientEnd} 100%
  );
  color: ${COLORS.textPrimary};
`;

export const MainContent = styled.main`
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
    padding: 2rem;
  }
`;

/**
 * Placeholder shown while a code-split section is fetched. It reserves a
 * generous minimum height so swapping the spinner for real content does not
 * introduce a layout shift.
 */
export const SectionFallback = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 60vh;
  color: ${COLORS.textPrimary};
`;
