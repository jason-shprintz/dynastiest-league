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
        <h2>The Dynastiest League</h2>
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
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis
        enim nisl nec elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis
        enim nisl nec elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis
        enim nisl nec elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis
        enim nisl nec elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod,
        urna eu tincidunt consectetur, nisi nisl aliquam enim, eget facilisis
        enim nisl nec elit. Pellentesque habitant morbi tristique senectus et
        netus et malesuada fames ac turpis egestas.
      </p>
    </HomeSection>
  );
};

export default MainContent;
