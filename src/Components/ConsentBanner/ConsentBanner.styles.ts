import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

export const BannerContainer = styled.div`
  position: fixed;
  z-index: 100;
  inset-inline: 0;
  bottom: 0;
  padding: 1rem;
  background: ${COLORS.background};
  border-top: 2px solid ${COLORS.secondary};
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.35);
  animation: consentRise 0.28s ease both;

  @keyframes consentRise {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

export const BannerInner = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  max-width: 1120px;
  margin-inline: auto;
`;

export const BannerText = styled.div`
  flex: 1 1 22rem;
`;

export const BannerTitle = styled.p`
  margin: 0 0 0.25rem;
  font-weight: 600;
  font-size: 1rem;
  color: ${COLORS.accent};
`;

export const BannerBody = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: ${COLORS.textSecondary};
`;

export const BannerLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: ${COLORS.accent};
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: ${COLORS.accentHover};
  }
`;

export const BannerActions = styled.div`
  display: flex;
  flex: 0 0 auto;
  gap: 0.6rem;
`;

/*
 * Both buttons share one style on purpose. Making refusal visually harder
 * than acceptance is the specific dark pattern regulators have fined people
 * for, so neither choice is nudged.
 */
export const ConsentButton = styled.button`
  padding: 0.5rem 1.25rem;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${COLORS.textPrimary};
  background: rgba(15, 52, 96, 0.4);
  border: 1px solid ${COLORS.secondary};
  border-radius: 8px;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    background: rgba(15, 52, 96, 0.7);
    border-color: ${COLORS.accent};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.accent};
    outline-offset: 2px;
  }
`;

