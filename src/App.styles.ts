import styled from 'styled-components';

export const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #ffffff;
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
