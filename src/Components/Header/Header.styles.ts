import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const HeaderContainer = styled.header`
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid ${COLORS.secondary};
  position: sticky;
  top: 0;
  z-index: 100;
`;

export const HeaderContent = styled.div`
  padding: 1rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

export const Navigation = styled.nav`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(15, 52, 96, 0.3);

  @media (max-width: 768px) {
    display: none;
  }
`;

export const NavButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.$isActive ? COLORS.secondary : "transparent"};
  border: 2px solid
    ${(props) => (props.$isActive ? COLORS.accent : COLORS.secondary)};
  color: ${(props) => (props.$isActive ? COLORS.accent : COLORS.textMuted)};
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
    border-color: ${COLORS.accent};
    color: ${COLORS.accent};
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 1.125rem;
    width: 100%;
  }
`;

export const MobileNavBar = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: rgba(15, 52, 96, 0.3);
    position: relative;
  }
`;

export const MobileTitle = styled.div`
  color: ${COLORS.accent};
  font-size: 1.125rem;
  font-weight: 600;
  text-align: center;
  flex: 1;
`;

export const HamburgerButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  position: absolute;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  z-index: 101;

  span {
    display: block;
    width: 25px;
    height: 3px;
    background: ${COLORS.accent};
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  &:hover span {
    background: ${COLORS.white};
  }
`;

export const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    backdrop-filter: blur(10px);
    z-index: 200;
    opacity: ${(props) => (props.$isOpen ? "1" : "0")};
    pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
    transition: opacity 0.3s ease;
  }
`;

export const MobileMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 5rem 2rem 2rem;
  height: 100%;
  overflow-y: auto;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: ${COLORS.accent};
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: all 0.3s ease;
  z-index: 201;

  &:hover {
    color: ${COLORS.white};
    transform: rotate(90deg);
  }
`;
