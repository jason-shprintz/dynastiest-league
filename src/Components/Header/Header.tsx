import { Section } from "../../types";
import {
  HeaderContainer,
  HeaderContent,
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
        <img
          src="/Hero.png"
          alt="Dynastiest League Hero"
          style={{
            width: "50%",
            maxWidth: "300px",
            height: "auto",
            borderRadius: "12px",
          }}
        />
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
