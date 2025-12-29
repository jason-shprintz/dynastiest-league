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
  team: "Jaxon Flaxon Waxon",
  owner: "jeffgottfried",
  year: "2025",
  record: "12-2",
  points: 1797.38,
  playoffRun: "Won semifinals 130.40-94.76, Won finals 137.20-83.94",
};

/**
 * Displays the reigning fantasy league champion's information.
 *
 * Renders a styled card showcasing the current champion with their team name,
 * owner, championship year, regular season record, total points, and playoff run details.
 *
 * @returns A React component displaying the champion's information card
 *
 * @example
 * ```tsx
 * <Champion />
 * ```
 */
const Champion = () => {
  return (
    <ChampionSection>
      <ChampionCard>
        <ChampionBadge>Reigning Champion</ChampionBadge>
        <ChampionTeam>{currentChampion.team}</ChampionTeam>
        <ChampionOwner>Owner: 👑 {currentChampion.owner}</ChampionOwner>
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
            <span className="value">{currentChampion.points}*</span>
          </ChampionStat>
          <ChampionStat
            style={{
              textAlign: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <span className="label">*Won Most Regular Season Points</span>
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
