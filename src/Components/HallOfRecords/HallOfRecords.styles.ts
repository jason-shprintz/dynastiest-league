import styled from 'styled-components';

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

export const SectionDescription = styled.p`
  text-align: center;
  color: #a8b2d1;
  font-size: 1.1rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const RecordsTable = styled.div`
  background: rgba(15, 52, 96, 0.3);
  border-radius: 12px;
  overflow: hidden;
  max-width: 900px;
  margin: 0 auto;
`;

export const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem;
  align-items: center;
  background: #0f3460;
  font-weight: 700;
  color: #ffd700;
  font-size: 1.1rem;

  @media (max-width: 768px) {
    grid-template-columns: 0.8fr 2fr 1fr 1fr;
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 2fr 1fr 1fr;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.85rem;
  }
`;

export const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr;
  gap: 1rem;
  padding: 1.25rem;
  align-items: center;
  border-bottom: 1px solid rgba(15, 52, 96, 0.5);
  transition: background 0.3s ease;

  &:hover {
    background: rgba(15, 52, 96, 0.5);
  }

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    grid-template-columns: 0.8fr 2fr 1fr 1fr;
    gap: 0.5rem;
    padding: 1rem;
    font-size: 0.9rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr 2fr 1fr 1fr;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    font-size: 0.8rem;
  }
`;

export const Year = styled.div`
  font-weight: 600;
  color: #ffd700;
`;

export const ChampionName = styled.div`
  font-weight: 700;
  color: #ccd6f6;
`;

export const Record = styled.div`
  color: #a8b2d1;
`;

export const Points = styled.div`
  color: #a8b2d1;
`;
