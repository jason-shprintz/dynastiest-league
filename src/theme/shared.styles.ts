import styled from 'styled-components';
import { COLORS } from './colors';

export const LoadingSpinner = styled.div`
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 215, 0, 0.3);
  border-top-color: ${COLORS.accent};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 480px) {
    width: 1.5rem;
    height: 1.5rem;
  }
`;
