import {
  HomeSection,
  Hero,
  HeroText,
  StatsGrid,
  StatCard,
  StatNumber,
  StatLabel,
  ContentSection,
  StyledParagraph,
} from "./MainContent.styles";

/**
 * MainContent component that displays the home page content for the Dynastiest League.
 *
 * This component renders the hero section with the league title, establishment year,
 * and key statistics (number of teams, seasons, and annual prize pool), followed by
 * a content section with a welcome message and description of the dynasty league format.
 *
 * @returns A React component containing the main landing page content
 *
 * @example
 * ```tsx
 * <MainContent />
 * ```
 */
const MainContent = () => {
  return (
    <HomeSection>
      <Hero>
        <h1>The Dynastiest League</h1>
        <HeroText>Est. 2020</HeroText>
        <StatsGrid>
          <StatCard>
            <StatNumber>10</StatNumber>
            <StatLabel>Teams</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>6</StatNumber>
            <StatLabel>Seasons</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>$1,000</StatNumber>
            <StatLabel>Annual Prize Pool</StatLabel>
          </StatCard>
        </StatsGrid>
      </Hero>
      <ContentSection>
        <StyledParagraph>
          Welcome to the Dynastiest League, where fantasy football meets
          competition and camaraderie. Established in 2020, our league has grown
          to include 10 dedicated teams battling it out each season for glory
          and a share of the $1,000 annual prize pool.
          <br />
          <br />
          As a dynasty league, we emphasize long-term team building and
          strategy, allowing managers to retain players year over year. Our
          commitment to a fair and engaging experience is reflected in our
          comprehensive league constitution, which outlines the rules, roster
          settings, scoring system, draft procedures, trading policies, and
          playoff structure.
          <br />
          <br />
          This site serves as a hub for all things Dynastiest League, providing
          access to our constitution, hall of records, and current champion
          details. It will continue to evolve as we add more features and
          content to enhance the league experience for all members.
        </StyledParagraph>
      </ContentSection>
    </HomeSection>
  );
};

export default MainContent;
