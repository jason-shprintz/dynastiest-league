import { Section } from "../../types";
import {
  HeaderContainer,
  HeaderContent,
  LeagueTitle,
  LeagueSubtitle,
  Navigation,
  NavButton,
} from "./Header.styles";

interface IHeaderProps {
  activeSection: Section;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
}

const Header = ({ activeSection, setActiveSection }: IHeaderProps) => {
  return (
    <HeaderContainer>
      <HeaderContent>
        <LeagueTitle>🏆 The Dynastiest League</LeagueTitle>
        <LeagueSubtitle>Est. 2020 • Dynasty Fantasy Football</LeagueSubtitle>
      </HeaderContent>
      <Navigation>
        <NavButton
          $isActive={activeSection === "home"}
          onClick={() => setActiveSection("home")}
        >
          Home
        </NavButton>
        <NavButton
          $isActive={activeSection === "records"}
          onClick={() => setActiveSection("records")}
        >
          Hall of Records
        </NavButton>
        <NavButton
          $isActive={activeSection === "champion"}
          onClick={() => setActiveSection("champion")}
        >
          Current Champion
        </NavButton>
        <NavButton
          $isActive={activeSection === "constitution"}
          onClick={() => setActiveSection("constitution")}
        >
          Constitution
        </NavButton>
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;
