import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const PageSection = styled.section`
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

export const SeasonSelectorRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
  flex-wrap: wrap;

  label {
    color: ${COLORS.textSecondary};
    font-size: 1rem;
    font-weight: 600;
  }
`;

export const SeasonSelect = styled.select`
  background: ${COLORS.secondary};
  color: ${COLORS.textPrimary};
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s;

  &:hover,
  &:focus {
    border-color: ${COLORS.accent};
  }

  option {
    background: ${COLORS.secondary};
  }
`;

export const TabBar = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  border: 1px solid
    ${({ $isActive }) =>
      $isActive ? COLORS.accent : "rgba(255, 215, 0, 0.25)"};
  background: ${({ $isActive }) =>
    $isActive ? COLORS.accent : "transparent"};
  color: ${({ $isActive }) =>
    $isActive ? COLORS.background : COLORS.textSecondary};
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${COLORS.accent};
    color: ${({ $isActive }) => ($isActive ? COLORS.background : COLORS.accent)};
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.accent};
    outline-offset: 2px;
  }
`;

export const ContentArea = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const LoadingMessage = styled.div`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  padding: 2rem;
`;

export const EmptyState = styled.div`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  padding: 3rem;
  background: rgba(15, 52, 96, 0.3);
  border-radius: 12px;
  margin: 2rem auto;
  max-width: 600px;
`;

export const LoadMoreButton = styled.button`
  margin: 2rem auto;
  padding: 0.75rem 2rem;
  background: ${COLORS.accent};
  color: ${COLORS.background};
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;

  &:hover {
    background: ${COLORS.accentHover};
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid ${COLORS.accent};
    outline-offset: 4px;
  }
`;

/* --- Standings --- */

export const StandingsWrapper = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

export const StandingsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead tr {
    border-bottom: 2px solid ${COLORS.accent};
  }

  th {
    padding: 0.6rem 0.75rem;
    text-align: left;
    color: ${COLORS.accent};
    font-weight: 700;
    white-space: nowrap;
  }

  td {
    padding: 0.6rem 0.75rem;
    color: ${COLORS.textSecondary};
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  tbody tr:hover td {
    background: rgba(15, 52, 96, 0.4);
  }

  .rank {
    color: ${COLORS.textMuted};
    width: 2rem;
  }

  .team {
    font-weight: 600;
    color: ${COLORS.textPrimary};
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .numeric {
    text-align: right;
  }

  /* Hide owner column on small screens — team name is sufficient */
  @media (max-width: 480px) {
    font-size: 0.82rem;

    th,
    td {
      padding: 0.45rem 0.4rem;
    }

    .team {
      max-width: 110px;
    }

    .hide-mobile {
      display: none;
    }
  }
`;

/* --- Teams --- */

export const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
`;

export const TeamCard = styled.div`
  background: rgba(15, 52, 96, 0.35);
  border: 1px solid rgba(255, 215, 0, 0.15);
  border-radius: 12px;
  padding: 1.25rem;
`;

export const TeamCardHeader = styled.div`
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);

  .team-name {
    font-size: 1rem;
    font-weight: 700;
    color: ${COLORS.accent};
  }

  .owner {
    font-size: 0.85rem;
    color: ${COLORS.textMuted};
    margin-top: 0.15rem;
  }
`;

export const PlayerGroupLabel = styled.p`
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${COLORS.textMuted};
  margin: 0.6rem 0 0.3rem;
`;

export const PlayerRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: ${COLORS.textSecondary};
  padding: 0.2rem 0;

  .pos {
    font-size: 0.75rem;
    font-weight: 700;
    color: ${COLORS.textMuted};
    min-width: 2.5rem;
  }
`;

/* --- Draft --- */

export const DraftTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;

  thead tr {
    border-bottom: 2px solid ${COLORS.accent};
  }

  th {
    padding: 0.6rem 0.75rem;
    text-align: left;
    color: ${COLORS.accent};
    font-weight: 700;
    white-space: nowrap;
  }

  td {
    padding: 0.6rem 0.75rem;
    color: ${COLORS.textSecondary};
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  tbody tr:hover td {
    background: rgba(15, 52, 96, 0.4);
  }

  .pick-no {
    color: ${COLORS.textMuted};
    width: 3rem;
  }

  .player {
    font-weight: 600;
    color: ${COLORS.textPrimary};
  }

  .pos {
    font-size: 0.85rem;
    color: ${COLORS.textMuted};
  }

  @media (max-width: 600px) {
    font-size: 0.85rem;

    th,
    td {
      padding: 0.5rem;
    }
  }
`;
