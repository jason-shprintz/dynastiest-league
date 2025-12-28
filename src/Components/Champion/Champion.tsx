import { CurrentChampion } from "../../types";
import {
  ChampionSection,
  ChampionCard,
  ChampionBadge,
  ChampionTeam,
  ChampionOwner,
  ChampionStats,
  ChampionStat,
  PlayoffRun,
} from "./Champion.styles";

const currentChampion: CurrentChampion = {
  team: "Team Thunder",
  owner: "Mike Johnson",
  year: "2023",
  record: "12-2",
  points: 1847,
  playoffRun: "Won semifinals 145-132, Won finals 168-143",
};

const Champion = () => {
  return (
    <ChampionSection>
      <ChampionCard>
        <ChampionBadge>👑 Reigning Champion</ChampionBadge>
        <ChampionTeam>{currentChampion.team}</ChampionTeam>
        <ChampionOwner>Owner: {currentChampion.owner}</ChampionOwner>
        <ChampionStats>
          <ChampionStat>
            <span className="label">Championship Year:</span>
            <span className="value">{currentChampion.year}</span>
          </ChampionStat>
          <ChampionStat>
            <span className="label">Regular Season:</span>
            <span className="value">{currentChampion.record}</span>
          </ChampionStat>
          <ChampionStat>
            <span className="label">Total Points:</span>
            <span className="value">{currentChampion.points}</span>
          </ChampionStat>
        </ChampionStats>
        <PlayoffRun>
          <h3>Championship Run</h3>
          <p>{currentChampion.playoffRun}</p>
        </PlayoffRun>
      </ChampionCard>
    </ChampionSection>
  );
};

export default Champion;
