import styled from "styled-components";

export const HeaderContainer = styled.header`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid #0f3460;
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  padding: 1.5rem;
  text-align: center;

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const LeagueTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 0.25rem;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

export const LeagueSubtitle = styled.p`
  font-size: 1rem;
  color: #a8b2d1;
  font-weight: 300;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(15, 52, 96, 0.3);

  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.5rem;
  }
`;

export const NavButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${(props) => (props.$isActive ? "#0f3460" : "transparent")};
  border: 2px solid ${(props) => (props.$isActive ? "#ffd700" : "#0f3460")};
  color: ${(props) => (props.$isActive ? "#ffd700" : "#a8b2d1")};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(15, 52, 96, 0.5);
    border-color: #ffd700;
    color: #ffd700;
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }
`;
