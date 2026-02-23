import styled from 'styled-components';
import { COLORS } from '../../theme/colors';

export const RecordsSection = styled.section`
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

export const RecordsTable = styled.div`
  background: rgba(15, 52, 96, 0.3);
  border-radius: 12px;
  overflow: hidden;
  max-width: 800px;
  width: auto;
  margin: 0 auto;
`;

export const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 1.25rem;
  background: ${COLORS.secondary};
  font-weight: 700;
  color: ${COLORS.accent};
  font-size: 1.1rem;
  gap: 1rem;
  & > div {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & > div:first-child {
    flex: 0 0 10%;
    min-width: 10%;
    max-width: 10%;
    width: 10%;
  }
  & > div:nth-child(2),
  & > div:nth-child(3),
  & > div:nth-child(4),
  & > div:nth-child(5) {
    flex: 0 0 30%;
    min-width: 30%;
    max-width: 30%;
    width: 30%;
  }

  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
`;

export const TableRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  border-bottom: 1px solid rgba(15, 52, 96, 0.5);
  transition: background 0.3s ease;
  & > div {
    flex: 1 1 0;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & > div:first-child {
    flex: 0 0 10%;
    min-width: 10%;
    max-width: 10%;
    width: 10%;
  }
  & > div:nth-child(2),
  & > div:nth-child(3),
  & > div:nth-child(4),
  & > div:nth-child(5) {
    flex: 0 0 30%;
    min-width: 30%;
    max-width: 30%;
    width: 30%;
  }
  &:hover {
    background: rgba(15, 52, 96, 0.5);
  }
  &:last-child {
    border-bottom: none;
  }
  @media (max-width: 768px) {
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
  }
  @media (max-width: 480px) {
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
`;

export const TableTitle = styled.div`
  font-weight: 600;
  width: 25%;
  min-width: 125px;
  color: ${COLORS.accent};
`;

export const Year = styled.div`
  font-weight: 600;
  color: ${COLORS.accent};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ChampionName = styled.div`
  font-weight: 900;
  color: ${COLORS.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SecondName = styled.div`
  font-weight: 700;
  color: ${COLORS.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ThirdName = styled.div`
  font-weight: 500;
  color: ${COLORS.textSecondary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const CustomMedalTable = styled(RecordsTable)``;
export const CustomMedalHeader = styled(TableHeader)`
  & > div:first-child {
    flex: 0 0 10%;
    min-width: 10%;
    max-width: 10%;
    width: 10%;
  }
  & > div:nth-child(2) {
    flex: 0 0 30%;
    min-width: 30%;
    max-width: 30%;
    width: 30%;
  }
  & > div:nth-child(3),
  & > div:nth-child(4),
  & > div:nth-child(5) {
    flex: 0 0 20%;
    min-width: 20%;
    max-width: 20%;
    width: 20%;
  }
`;
export const CustomMedalRow = styled(TableRow)`
  & > div:first-child {
    flex: 0 0 10%;
    min-width: 10%;
    max-width: 10%;
    width: 10%;
  }
  & > div:nth-child(2) {
    flex: 0 0 30%;
    min-width: 30%;
    max-width: 30%;
    width: 30%;
  }
  & > div:nth-child(3),
  & > div:nth-child(4),
  & > div:nth-child(5) {
    flex: 0 0 20%;
    min-width: 20%;
    max-width: 20%;
    width: 20%;
  }
`;

export const AllTimeTable = styled(RecordsTable)``;

export const AllTimeHeader = styled(TableHeader)`
  & > div:first-child {
    flex: 0 0 28%;
    min-width: 28%;
    max-width: 28%;
    width: 28%;
  }
  & > :nth-child(2),
  & > :nth-child(3) {
    flex: 0 0 12%;
    min-width: 12%;
    max-width: 12%;
    width: 12%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  & > :nth-child(4),
  & > :nth-child(5) {
    flex: 0 0 24%;
    min-width: 24%;
    max-width: 24%;
    width: 24%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  @media (max-width: 480px) {
    & > div:first-child {
      flex: 0 0 22%;
      min-width: 22%;
      max-width: 22%;
      width: 22%;
    }
    & > :nth-child(2),
    & > :nth-child(3) {
      flex: 0 0 10%;
      min-width: 10%;
      max-width: 10%;
      width: 10%;
    }
    & > :nth-child(4),
    & > :nth-child(5) {
      flex: 0 0 29%;
      min-width: 29%;
      max-width: 29%;
      width: 29%;
    }
  }
`;

export const AllTimeRow = styled(TableRow)<{ $isFormer?: boolean }>`
  & > div:first-child {
    flex: 0 0 28%;
    min-width: 28%;
    max-width: 28%;
    width: 28%;
  }
  & > div:nth-child(2),
  & > div:nth-child(3) {
    flex: 0 0 12%;
    min-width: 12%;
    max-width: 12%;
    width: 12%;
  }
  & > div:nth-child(4),
  & > div:nth-child(5) {
    flex: 0 0 24%;
    min-width: 24%;
    max-width: 24%;
    width: 24%;
  }
  @media (max-width: 480px) {
    & > div:first-child {
      flex: 0 0 22%;
      min-width: 22%;
      max-width: 22%;
      width: 22%;
    }
    & > div:nth-child(2),
    & > div:nth-child(3) {
      flex: 0 0 10%;
      min-width: 10%;
      max-width: 10%;
      width: 10%;
    }
    & > div:nth-child(4),
    & > div:nth-child(5) {
      flex: 0 0 29%;
      min-width: 29%;
      max-width: 29%;
      width: 29%;
    }
  }
  ${({ $isFormer }) =>
    $isFormer &&
    `
    background: rgba(220, 60, 60, 0.12);
    &:hover {
      background: rgba(220, 60, 60, 0.22);
    }
  `}
`;

export const SortableCell = styled.button`
  cursor: pointer;
  user-select: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  &:hover {
    color: ${COLORS.accentHover};
  }
  &:focus-visible {
    outline: 2px solid ${COLORS.accent};
    outline-offset: 2px;
  }
`;

export const StandingsLoadingRow = styled(AllTimeRow)`
  justify-content: center;
  color: ${COLORS.textMuted};
`;
