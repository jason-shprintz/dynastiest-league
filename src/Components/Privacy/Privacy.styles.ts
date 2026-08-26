import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

export const PrivacySection = styled.section`
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
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const UpdatedDate = styled.p`
  text-align: center;
  color: ${COLORS.textMuted};
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  opacity: 0.7;
  margin-bottom: 2rem;
`;

export const PrivacyContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const PrivacyItem = styled.div`
  background: rgba(15, 52, 96, 0.3);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${COLORS.accent};

  h3 {
    color: ${COLORS.accent};
    margin-bottom: 0.75rem;
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  p,
  li {
    color: ${COLORS.textSecondary};
    line-height: 1.7;
    font-size: 1.05rem;

    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }

  p {
    margin-bottom: 1rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    margin: 0 0 1rem;
    padding-left: 1.25rem;
  }

  li {
    margin-bottom: 0.4rem;
  }

  strong {
    color: ${COLORS.textPrimary};
  }

  a {
    color: ${COLORS.accent};

    &:hover,
    &:focus-visible {
      color: ${COLORS.accentHover};
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;
