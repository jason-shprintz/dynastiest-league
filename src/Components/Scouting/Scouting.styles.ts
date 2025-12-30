import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const ScoutingSection = styled.section`
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

export const EmbedGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
`;

export const EmbedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h3 {
    color: ${COLORS.accent};
    margin-bottom: 1rem;
    font-size: 1.3rem;
    text-align: center;
  }
`;

export const EmbedWrapper = styled.div`
  background: rgba(15, 52, 96, 0.4);
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid ${COLORS.secondary};
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: ${COLORS.accent};
    box-shadow: 0 10px 30px rgba(255, 215, 0, 0.15);
  }

  iframe {
    display: block;
    border-radius: 8px;
    border: none;
  }

  @media (max-width: 480px) {
    padding: 0.5rem;

    iframe {
      width: 100%;
      max-width: 320px;
    }
  }
`;
