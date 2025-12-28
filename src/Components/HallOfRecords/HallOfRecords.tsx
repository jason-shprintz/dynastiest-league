import { hallOfRecords } from "./data";
import {
  RecordsSection,
  SectionDescription,
  RecordsTable,
  TableHeader,
  TableRow,
  Year,
  ChampionName,
  Record,
  Points,
} from "./HallOfRecords.styles";

const HallOfRecords = () => {
  return (
    <RecordsSection>
      <h2>Hall of Records</h2>
      <SectionDescription>Champions throughout the years</SectionDescription>
      <RecordsTable>
        <TableHeader>
          <div>Year</div>
          <div>Champion</div>
          <div>Record</div>
          <div>Points</div>
        </TableHeader>
        {hallOfRecords.map((record) => (
          <TableRow key={record.year}>
            <Year>{record.year}</Year>
            <ChampionName>{record.champion}</ChampionName>
            <Record>{record.record}</Record>
            <Points>{record.points}</Points>
          </TableRow>
        ))}
      </RecordsTable>
    </RecordsSection>
  );
};

export default HallOfRecords;
