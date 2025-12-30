import { useState } from "react";
import { Section } from "../../types";
import {
  HeaderContainer,
  HeaderContent,
  Navigation,
  NavButton,
  MobileNavBar,
  MobileTitle,
  HamburgerButton,
  MobileMenuOverlay,
  MobileMenuContainer,
  CloseButton,
} from "./Header.styles";

interface IHeaderProps {
  activeSection: Section;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
}

const sectionLabels: Record<Section, string> = {
  home: "Home",
  records: "Hall of Records",
  champion: "Current Champion",
  constitution: "Constitution",
  scouting: "Scouting",
  blog: "Blog",
};

/**
 * Header component that displays the league hero image and navigation menu.
 *
 * @param props - The component props
 * @param props.activeSection - The currently active navigation section
 * @param props.setActiveSection - Callback function to update the active section
 * @returns A header element containing the hero image and navigation buttons
 */
const Header = ({ activeSection, setActiveSection }: IHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

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

      {/* Desktop Navigation */}
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
          $isActive={activeSection === "scouting"}
          onClick={() => setActiveSection("scouting")}
        >
          Scouting
        </NavButton>
        <NavButton
          $isActive={activeSection === "blog"}
          onClick={() => setActiveSection("blog")}
        >
          Blog
        </NavButton>
      </Navigation>

      {/* Mobile Navigation Bar */}
      <MobileNavBar>
        <MobileTitle>{sectionLabels[activeSection]}</MobileTitle>
        <HamburgerButton
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </HamburgerButton>
      </MobileNavBar>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay $isOpen={isMobileMenuOpen}>
        <MobileMenuContainer>
          <CloseButton
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </CloseButton>
          <NavButton
            $isActive={activeSection === "home"}
            onClick={() => handleNavClick("home")}
          >
            Home
          </NavButton>
          <NavButton
            $isActive={activeSection === "records"}
            onClick={() => handleNavClick("records")}
          >
            Hall of Records
          </NavButton>
          <NavButton
            $isActive={activeSection === "champion"}
            onClick={() => handleNavClick("champion")}
          >
            Current Champion
          </NavButton>
          <NavButton
            $isActive={activeSection === "constitution"}
            onClick={() => handleNavClick("constitution")}
          >
            Constitution
          </NavButton>
          <NavButton
            $isActive={activeSection === "scouting"}
            onClick={() => handleNavClick("scouting")}
          >
            Scouting
          </NavButton>
          <NavButton
            $isActive={activeSection === "blog"}
            onClick={() => handleNavClick("blog")}
          >
            Blog
          </NavButton>
        </MobileMenuContainer>
      </MobileMenuOverlay>
    </HeaderContainer>
  );
};

export default Header;
