import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

export const FooterContainer = styled.footer`
  background: rgba(0, 0, 0, 0.4);
  border-top: 2px solid ${COLORS.secondary};
  padding: 1.5rem;
  text-align: center;
  color: ${COLORS.textMuted};
`;

export const Copyright = styled.p`
  margin: 0;
`;

export const FooterMeta = styled.div`
  margin-top: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-size: 0.85rem;
`;

export const FooterLink = styled.a`
  color: ${COLORS.textMuted};
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover,
  &:focus-visible {
    color: ${COLORS.accent};
    border-bottom-color: ${COLORS.accent};
  }
`;

export const Separator = styled.span`
  opacity: 0.4;
`;

/**
 * Deliberately low-contrast and monospaced: useful when someone needs to say
 * which build they are looking at, invisible the rest of the time.
 */
export const AppVersion = styled.span`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  opacity: 0.5;
`;
