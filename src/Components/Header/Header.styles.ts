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
  padding: 1rem;
  text-align: center;

  @media (max-width: 480px) {
    padding: 1rem;
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
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
    padding: 0.5rem 0.2rem;
    width: 100vw;
    box-sizing: border-box;
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
  min-width: 0;
  box-sizing: border-box;

  &:hover {
    background: rgba(15, 52, 96, 0.5);
    border-color: #ffd700;
    color: #ffd700;
    transform: translateY(-2px);
  }

  @media (max-width: 480px) {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    margin: 0;
  }
`;
