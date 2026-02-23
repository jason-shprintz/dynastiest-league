import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { hallOfRecords, medalCounts } from "./data";
import { useStore, usePreviousSeasonsStore } from "../../stores";
import { DEFAULT_LEAGUE_ID } from "../../constants";
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
  CustomMedalHeader,
  CustomMedalRow,
  CustomMedalTable,
  AllTimeTable,
  AllTimeHeader,
  AllTimeRow,
  SortableCell,
  StandingsLoadingRow,
} from "./HallOfRecords.styles";

type SortField = "wins" | "losses" | "pf" | "pa";
type SortDir = "asc" | "desc";

/**
 * Displays the Hall of Records component featuring championship history, all-time medal rankings,
 * and all-time regular season standings aggregated across all historical seasons.
 *
 * This component renders three main sections:
 * 1. A historical table showing yearly champions, second, and third place finishers
 * 2. An all-time medal rankings table with gold, silver, and bronze counts per user
 * 3. An all-time standings table aggregating wins, losses, points for, and points against
 *    per owner across all seasons in which they participated
 *
 * Medal rankings are sorted by gold count first, then silver, then bronze,
 * with alphabetical ordering as a tiebreaker. Tied entries share the same rank.
 *
 * @returns A React component displaying the Hall of Records with championship history and medal standings
 */
const HallOfRecords = observer(() => {
  const { rostersStore } = useStore();
  const previousSeasonsStore = usePreviousSeasonsStore();
  const [sortField, setSortField] = useState<SortField>("wins");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Load current season rosters to know which owners are active this year
  useEffect(() => {
    if (rostersStore.rosters.length === 0 && !rostersStore.isLoading) {
      rostersStore.loadRosters(DEFAULT_LEAGUE_ID);
    }
  }, [rostersStore]);

  // Build the season chain on mount if not already loaded
  useEffect(() => {
    if (
      previousSeasonsStore.seasons.length === 0 &&
      !previousSeasonsStore.isLoadingSeasons
    ) {
      previousSeasonsStore.buildSeasonChain();
    }
  }, [previousSeasonsStore]);

  // Once seasons are available, load all-seasons data for standings aggregation
  useEffect(() => {
    if (
      previousSeasonsStore.seasons.length > 0 &&
      previousSeasonsStore.allSeasonsData.length === 0 &&
      !previousSeasonsStore.isLoadingAllSeasons
    ) {
      previousSeasonsStore.loadAllSeasonsData();
    }
  }, [previousSeasonsStore, previousSeasonsStore.seasons.length]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d: SortDir) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDir === "desc" ? " ▼" : " ▲";
  };

  // Set of owner IDs who are in the current season.
  // Only populated once rosters have loaded; empty Set means "not yet known".
  const currentOwnerIds = useMemo(
    () =>
      new Set(
        rostersStore.rosters.filter((r) => r.owner_id).map((r) => r.owner_id),
      ),
    [rostersStore.rosters],
  );

  // Aggregate all-time standings from all historical seasons.
  // All owners are included; isFormer flags those no longer in the current season.
  const allTimeStandings = useMemo(() => {
    const map = new Map<
      string,
      {
        displayName: string;
        wins: number;
        losses: number;
        pf: number;
        pa: number;
      }
    >();

    for (const { rosters, users } of previousSeasonsStore.allSeasonsData) {
      for (const roster of rosters) {
        const ownerId = roster.owner_id;
        if (!ownerId) continue;

        const existing = map.get(ownerId);

        const pf = roster.settings.fpts + roster.settings.fpts_decimal / 100;
        const pa =
          roster.settings.fpts_against +
          roster.settings.fpts_against_decimal / 100;

        if (existing) {
          map.set(ownerId, {
            displayName: existing.displayName,
            wins: existing.wins + roster.settings.wins,
            losses: existing.losses + roster.settings.losses,
            pf: existing.pf + pf,
            pa: existing.pa + pa,
          });
        } else {
          const user = users.find((u) => u.user_id === ownerId);
          const displayName = user?.display_name || user?.username || ownerId;
          map.set(ownerId, {
            displayName,
            wins: roster.settings.wins,
            losses: roster.settings.losses,
            pf,
            pa,
          });
        }
      }
    }

    return [...map.entries()].map(([ownerId, data]) => ({
      ownerId,
      ...data,
      isFormer: currentOwnerIds.size > 0 && !currentOwnerIds.has(ownerId),
    }));
  }, [previousSeasonsStore.allSeasonsData, currentOwnerIds]);

  const sortedStandings = useMemo(() => {
    return [...allTimeStandings].sort((a, b) => {
      const mult = sortDir === "desc" ? -1 : 1;
      if (sortField === "wins") return mult * (a.wins - b.wins);
      if (sortField === "losses") return mult * (a.losses - b.losses);
      if (sortField === "pf") return mult * (a.pf - b.pf);
      return mult * (a.pa - b.pa);
    });
  }, [allTimeStandings, sortField, sortDir]);
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
      <CustomMedalTable>
        <CustomMedalHeader>
          <div>Rank</div>
          <div>User</div>
          <div>Gold 🥇</div>
          <div>Silver 🥈</div>
          <div>Bronze 🥉</div>
        </CustomMedalHeader>
        {rankings.map((entry) => (
          <CustomMedalRow key={entry.user}>
            <div>{entry.rank}</div>
            <div>{entry.user}</div>
            <div>{entry.gold}</div>
            <div>{entry.silver}</div>
            <div>{entry.bronze}</div>
          </CustomMedalRow>
        ))}
      </CustomMedalTable>

      <h2 style={{ marginTop: "2.5rem" }}>All-Time Standings</h2>
      <AllTimeTable>
        <AllTimeHeader>
          <div>Owner</div>
          <SortableCell onClick={() => handleSort("wins")}>
            W{sortIndicator("wins")}
          </SortableCell>
          <SortableCell onClick={() => handleSort("losses")}>
            L{sortIndicator("losses")}
          </SortableCell>
          <SortableCell onClick={() => handleSort("pf")}>
            PF{sortIndicator("pf")}
          </SortableCell>
          <SortableCell onClick={() => handleSort("pa")}>
            PA{sortIndicator("pa")}
          </SortableCell>
        </AllTimeHeader>
        {previousSeasonsStore.isLoadingSeasons ||
        previousSeasonsStore.isLoadingAllSeasons ||
        rostersStore.isLoading ? (
          <StandingsLoadingRow>
            <div>Loading standings…</div>
          </StandingsLoadingRow>
        ) : (
          sortedStandings.map((entry) => (
            <AllTimeRow key={entry.ownerId} $isFormer={entry.isFormer}>
              <div>{entry.displayName}</div>
              <div>{entry.wins}</div>
              <div>{entry.losses}</div>
              <div>{entry.pf.toFixed(2)}</div>
              <div>{entry.pa.toFixed(2)}</div>
            </AllTimeRow>
          ))
        )}
      </AllTimeTable>
    </RecordsSection>
  );
});

export default HallOfRecords;
