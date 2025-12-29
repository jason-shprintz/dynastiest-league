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

/**
 * Header component that displays the league hero image and navigation menu.
 *
 * @param props - The component props
 * @param props.activeSection - The currently active navigation section
 * @param props.setActiveSection - Callback function to update the active section
 * @returns A header element containing the hero image and navigation buttons
 */
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
        <NavButton
          $isActive={activeSection === "blog"}
          onClick={() => setActiveSection("blog")}
        >
          Blog
        </NavButton>
      </Navigation>
    </HeaderContainer>
  );
};

export default Header;
