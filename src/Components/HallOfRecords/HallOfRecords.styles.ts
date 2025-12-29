import styled from "styled-components";

export const RecordsSection = styled.section`
  animation: fadeIn 0.5s ease-in;

  h2 {
    font-size: 2.5rem;
    color: #ffd700;
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
  background: #0f3460;
  font-weight: 700;
  color: #ffd700;
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
  color: #ffd700;
`;

export const Year = styled.div`
  font-weight: 600;
  color: #ffd700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ChampionName = styled.div`
  font-weight: 900;
  color: #ccd6f6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SecondName = styled.div`
  font-weight: 700;
  color: #ccd6f6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ThirdName = styled.div`
  font-weight: 500;
  color: #ccd6f6;
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
