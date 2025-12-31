import { useState, useCallback, useRef } from "react";
import { Section } from "../../types";
import { useMobileMenuAccessibility } from "../../hooks/useMobileMenuAccessibility";
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

interface NavItem {
  section: Section;
  label: string;
}

const navItems: NavItem[] = [
  { section: "home", label: "Home" },
  { section: "records", label: "Hall of Records" },
  { section: "champion", label: "Current Champion" },
  { section: "constitution", label: "Constitution" },
  { section: "scouting", label: "Scouting" },
  { section: "blog", label: "Blog" },
  { section: "teams", label: "Teams" },
];

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
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleNavClick = (section: Section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false);
  };

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  // Get label for current section
  const currentLabel =
    navItems.find((item) => item.section === activeSection)?.label || "Home";

  // Handle keyboard interactions for mobile menu (Escape to close, Tab to trap focus)
  useMobileMenuAccessibility({
    isOpen: isMobileMenuOpen,
    onClose: handleCloseMobileMenu,
    overlayRef,
  });

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
        {navItems.map((item) => (
          <NavButton
            key={item.section}
            $isActive={activeSection === item.section}
            onClick={() => setActiveSection(item.section)}
          >
            {item.label}
          </NavButton>
        ))}
      </Navigation>

      {/* Mobile Navigation Bar */}
      <MobileNavBar>
        <MobileTitle>{currentLabel}</MobileTitle>
        <HamburgerButton
          ref={hamburgerRef}
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </HamburgerButton>
      </MobileNavBar>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay
        ref={overlayRef}
        $isOpen={isMobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <CloseButton onClick={handleCloseMobileMenu} aria-label="Close menu">
          ✕
        </CloseButton>
        <MobileMenuContainer>
          {navItems.map((item) => (
            <NavButton
              key={item.section}
              $isActive={activeSection === item.section}
              onClick={() => handleNavClick(item.section)}
            >
              {item.label}
            </NavButton>
          ))}
        </MobileMenuContainer>
      </MobileMenuOverlay>
    </HeaderContainer>
  );
};

export default Header;
