import { hallOfRecords, medalCounts } from "./data";
import {
  RecordsSection,
  RecordsTable,
  TableHeader,
  TableRow,
  Year,
  ChampionName,
  SecondName,
  ThirdName,
  TableTitle,
} from "./HallOfRecords.styles";

const HallOfRecords = () => {
  // Prepare sorted rankings array
  const rankingsRaw = Object.entries(medalCounts)
    .map(([user, medals]) => ({ user, ...medals }))
    .sort((a, b) => {
      if (b.gold !== a.gold) return b.gold - a.gold;
      if (b.silver !== a.silver) return b.silver - a.silver;
      if (b.bronze !== a.bronze) return b.bronze - a.bronze;
      return a.user.localeCompare(b.user);
    });

  // Assign ranks with ties
  let last: string | null = null;
  let rank = 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let skip = 1;
  const rankings = rankingsRaw.map((entry, idx) => {
    const key = `${entry.gold}-${entry.silver}-${entry.bronze}`;
    if (!last || key !== last) {
      rank = idx + 1;
      skip = 1;
    } else {
      skip++;
    }
    last = key;
    return { ...entry, rank };
  });

  return (
    <RecordsSection>
      <h2>Hall of Records</h2>
      <RecordsTable>
        <TableHeader>
          <Year>Year</Year>
          <TableTitle>Champion</TableTitle>
          <TableTitle>Second</TableTitle>
          <TableTitle>Third</TableTitle>
        </TableHeader>
        {hallOfRecords.map((record) => (
          <TableRow key={record.year}>
            <Year>{record.year}</Year>
            <ChampionName>{record.champion}</ChampionName>
            <SecondName>{record.second}</SecondName>
            <ThirdName>{record.third}</ThirdName>
          </TableRow>
        ))}
      </RecordsTable>

      <h2 style={{ marginTop: "2.5rem" }}>All-Time Medal Rankings</h2>
      <RecordsTable>
        <TableHeader>
          <TableTitle>Rank</TableTitle>
          <TableTitle>User</TableTitle>
          <TableTitle>Gold 🥇</TableTitle>
          <TableTitle>Silver 🥈</TableTitle>
          <TableTitle>Bronze 🥉</TableTitle>
        </TableHeader>
        {rankings.map((entry) => (
          <TableRow key={entry.user}>
            <Year>{entry.rank}</Year>
            <ChampionName>{entry.user}</ChampionName>
            <ChampionName>{entry.gold}</ChampionName>
            <SecondName>{entry.silver}</SecondName>
            <ThirdName>{entry.bronze}</ThirdName>
          </TableRow>
        ))}
      </RecordsTable>
    </RecordsSection>
  );
};

export default HallOfRecords;
