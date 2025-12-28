import { CurrentChampion } from "../../types";

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
    <section className="champion-section">
      <div className="champion-card">
        <div className="champion-badge">👑 Reigning Champion</div>
        <h2 className="champion-team">{currentChampion.team}</h2>
        <p className="champion-owner">Owner: {currentChampion.owner}</p>
        <div className="champion-stats">
          <div className="champion-stat">
            <span className="label">Championship Year:</span>
            <span className="value">{currentChampion.year}</span>
          </div>
          <div className="champion-stat">
            <span className="label">Regular Season:</span>
            <span className="value">{currentChampion.record}</span>
          </div>
          <div className="champion-stat">
            <span className="label">Total Points:</span>
            <span className="value">{currentChampion.points}</span>
          </div>
        </div>
        <div className="playoff-run">
          <h3>Championship Run</h3>
          <p>{currentChampion.playoffRun}</p>
        </div>
      </div>
    </section>
  );
};

export default Champion;
