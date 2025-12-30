import { useState, useEffect, useRef } from "react";
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

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
    hamburgerRef.current?.focus();
  };

  // Get label for current section
  const currentLabel =
    navItems.find((item) => item.section === activeSection)?.label || "Home";

  // Handle keyboard interactions for mobile menu (Escape to close, Tab to trap focus)
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleCloseMobileMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const overlay = overlayRef.current;
      if (!overlay) {
        return;
      }

      const focusableElements = overlay.querySelectorAll("button");
      if (!focusableElements.length) {
        return;
      }

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;
      const activeElement = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        // Shift+Tab: move focus backwards, wrap from first to last
        if (!activeElement || activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move focus forwards, wrap from last to first
        if (!activeElement || activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Focus first navigation button (skip close button when available)
    const navButtons = overlayRef.current?.querySelectorAll("button");
    if (navButtons && navButtons.length > 1) {
      (navButtons[1] as HTMLButtonElement).focus();
    } else if (navButtons && navButtons.length === 1) {
      (navButtons[0] as HTMLButtonElement).focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      // Restore original body scroll behavior
      document.body.style.overflow = originalOverflow;
    };
  }, [isMobileMenuOpen]);

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
        <MobileMenuContainer>
          <CloseButton onClick={handleCloseMobileMenu} aria-label="Close menu">
            ✕
          </CloseButton>
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
