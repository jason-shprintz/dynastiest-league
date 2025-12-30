import {
  ScoutingSection,
  SectionDescription,
  EmbedGrid,
  EmbedContainer,
  EmbedWrapper,
} from "./Scouting.styles";

/**
 * Scouting component that displays player trending data and scouting tools.
 *
 * This component renders embedded widgets from Sleeper showing trending
 * player adds and drops to help league managers with their scouting decisions.
 *
 * @returns A React component containing scouting tools and trending player data
 */
const Scouting = () => {
  return (
    <ScoutingSection>
      <h2>Scouting Report</h2>
      <SectionDescription>
        Stay ahead of the competition with real-time player trends
      </SectionDescription>
      <EmbedGrid>
        <EmbedContainer>
          <h3>🔥 Trending Adds</h3>
          <EmbedWrapper>
            <iframe
              src="https://sleeper.app/embed/players/nfl/trending/add?lookback_hours=24&limit=25"
              width="350"
              height="500"
              title="Sleeper Trending Player Adds"
              aria-label="List of trending player adds in the last 24 hours from Sleeper"
              loading="lazy"
              allowTransparency={true}
              tabIndex={0}
            />
          </EmbedWrapper>
        </EmbedContainer>
        <EmbedContainer>
          <h3>📉 Trending Drops</h3>
          <EmbedWrapper>
            <iframe
              src="https://sleeper.app/embed/players/nfl/trending/drop?lookback_hours=24&limit=25"
              width="350"
              height="500"
              title="Sleeper Trending Player Drops"
              aria-label="List of trending player drops in the last 24 hours from Sleeper"
              loading="lazy"
              allowTransparency={true}
              tabIndex={0}
            />
          </EmbedWrapper>
        </EmbedContainer>
      </EmbedGrid>
    </ScoutingSection>
  );
};

export default Scouting;
