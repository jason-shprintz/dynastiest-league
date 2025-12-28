import {
  HomeSection,
  Hero,
  HeroText,
  StatsGrid,
  StatCard,
  StatNumber,
  StatLabel,
} from "./MainContent.styles";

const MainContent = () => {
  return (
    <HomeSection>
      <Hero>
        <h2>Welcome to the Dynastiest League</h2>
        <HeroText>
          Where champions are made and dynasties are built. This is more than
          just fantasy football— it's a legacy that spans seasons, a brotherhood
          of competition, and a pursuit of glory.
        </HeroText>
        <StatsGrid>
          <StatCard>
            <StatNumber>10</StatNumber>
            <StatLabel>Teams</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>4</StatNumber>
            <StatLabel>Seasons</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>$1,000</StatNumber>
            <StatLabel>Annual Prize Pool</StatLabel>
          </StatCard>
        </StatsGrid>
      </Hero>
    </HomeSection>
  );
};

export default MainContent;
