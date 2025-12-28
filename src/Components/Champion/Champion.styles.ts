import styled from 'styled-components';

export const ChampionSection = styled.section`
  animation: fadeIn 0.5s ease-in;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
`;

export const ChampionCard = styled.div`
  background: rgba(15, 52, 96, 0.4);
  border: 3px solid #ffd700;
  border-radius: 16px;
  padding: 3rem;
  max-width: 700px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);

  @media (max-width: 768px) {
    padding: 2rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

export const ChampionBadge = styled.div`
  display: inline-block;
  background: #ffd700;
  color: #1a1a2e;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 800;
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

export const ChampionTeam = styled.h2`
  font-size: 3rem;
  color: #ffd700;
  margin-bottom: 0.5rem;
  font-weight: 900;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

export const ChampionOwner = styled.p`
  font-size: 1.3rem;
  color: #a8b2d1;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

export const ChampionStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
`;

export const ChampionStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(168, 178, 209, 0.2);

  &:last-child {
    border-bottom: none;
  }

  .label {
    color: #a8b2d1;
    font-weight: 600;
  }

  .value {
    color: #ccd6f6;
    font-weight: 700;
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
`;

export const PlayoffRun = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid rgba(255, 215, 0, 0.3);

  h3 {
    color: #ffd700;
    margin-bottom: 1rem;
    font-size: 1.5rem;

    @media (max-width: 480px) {
      font-size: 1.2rem;
    }
  }

  p {
    color: #ccd6f6;
    line-height: 1.6;
    font-size: 1.1rem;

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
`;
