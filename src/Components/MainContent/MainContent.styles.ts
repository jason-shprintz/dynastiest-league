import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const HomeSection = styled.section`
  animation: fadeIn 0.5s ease-in;
`;

export const Hero = styled.div`
  text-align: center;
  padding: 2rem 1rem;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    color: ${COLORS.accent};

    @media (max-width: 768px) {
      font-size: 2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
  }
`;

export const HeroText = styled.p`
  font-size: 1.2rem;
  line-height: 1.8;
  color: ${COLORS.textSecondary};
  max-width: 800px;
  margin: 0 auto 3rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 769px) and (max-width: 1024px) and (orientation: landscape) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const StatCard = styled.div`
  background: rgba(15, 52, 96, 0.4);
  padding: 2rem;
  border-radius: 12px;
  border: 2px solid ${COLORS.secondary};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${COLORS.accent};
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.2);
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }
`;

export const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 800;
  color: ${COLORS.accent};
  margin-bottom: 0.5rem;

  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

export const StatLabel = styled.div`
  font-size: 1.1rem;
  color: ${COLORS.textMuted};
`;
