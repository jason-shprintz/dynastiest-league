import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const TradeCardContainer = styled.div`
  background: rgba(15, 52, 96, 0.3);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${COLORS.accent};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(15, 52, 96, 0.5);
    transform: translateY(-2px);
  }

  &:focus-within {
    background: rgba(15, 52, 96, 0.5);
    outline: 2px solid ${COLORS.accent};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const TradeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

export const TradeDate = styled.div`
  color: ${COLORS.textMuted};
  font-size: 0.9rem;
  font-style: italic;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export const TradeStatus = styled.span`
  background: ${COLORS.accent};
  color: ${COLORS.background};
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    padding: 0.2rem 0.6rem;
  }
`;

export const TradeParties = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

export const TradeArrow = styled.div`
  font-size: 2rem;
  color: ${COLORS.accent};
  align-self: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const TeamSection = styled.div`
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
`;

export const TeamName = styled.h3`
  color: ${COLORS.accent};
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
  padding-bottom: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const ItemsTitle = styled.h4`
  color: ${COLORS.textMuted};
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export const Item = styled.div`
  color: ${COLORS.textSecondary};
  font-size: 1rem;
  padding-left: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

export const EmptyItems = styled.div`
  color: ${COLORS.textMuted};
  font-style: italic;
  font-size: 0.95rem;
  padding-left: 0.5rem;

  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;
