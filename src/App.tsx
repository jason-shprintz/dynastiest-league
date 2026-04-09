import { useState, useCallback, useEffect } from 'react';
import GlobalStyles from './GlobalStyles';
import { AppContainer, MainContent } from './App.styles';
import AllTeams from './Components/AllTeams/AllTeams';
import Blog from './Components/Blog/Blog';
import Champion from './Components/Champion/Champion';
import Constitution from './Components/Constitution/Constitution';
import Footer from './Components/Footer/Footer';
import HallOfRecords from './Components/HallOfRecords/HallOfRecords';
import Header from './Components/Header/Header';
import Home from './Components/MainContent/MainContent';
import Scouting from './Components/Scouting/Scouting';
import Trades from './Components/Trades/Trades';
import PreviousSeasons from './Components/PreviousSeasons/PreviousSeasons';
import { NavigationTarget, Section } from './types';
import usePageMeta from './hooks/usePageMeta';

/**
 * Root application component that manages navigation state and renders the main layout.
 *
 * @remarks
 * This component serves as the entry point for the Dynastiest League application.
 * It maintains the active section state and conditionally renders the appropriate
 * content component based on user navigation.
 *
 * @returns The complete application layout including header, main content area, and footer
 *
 * @example
 * ```tsx
 * <App />
 * ```
 */
const isValidSection = (value: string): value is Section => {
  const validSections: Section[] = [
    'home',
    'blog',
    'teams',
    'trades',
    'scouting',
    'records',
    'champion',
    'previous-seasons',
    'constitution',
  ];
  return validSections.includes(value as Section);
};

function App() {
  const initialSection = (): Section => {
    const hash = window.location.hash.replace('#', '');
    return isValidSection(hash) ? hash : 'home';
  };

  const [activeSection, setActiveSection] = useState<Section>(initialSection);
  const [targetSubsection, setTargetSubsection] = useState<string | undefined>(
    undefined,
  );

  // Sync URL hash whenever the active section changes
  useEffect(() => {
    const newHash = activeSection === 'home' ? '' : `#${activeSection}`;
    if (window.location.hash !== newHash) {
      window.history.pushState(null, '', newHash || window.location.pathname);
    }
  }, [activeSection]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const hash = window.location.hash.replace('#', '');
      const section = isValidSection(hash) ? hash : 'home';
      setActiveSection(section);
      setTargetSubsection(undefined);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  usePageMeta(activeSection);

  const handleNavigate = useCallback((target: NavigationTarget) => {
    setActiveSection(target.section);
    setTargetSubsection(target.subsection);
  }, []);

  const handleSectionChange = useCallback((section: Section) => {
    setActiveSection(section);
    setTargetSubsection(undefined);
  }, []);

  const handleSubsectionViewed = useCallback(() => {
    setTargetSubsection(undefined);
  }, []);

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header
          activeSection={activeSection}
          setActiveSection={handleSectionChange}
        />

        <MainContent>
          {activeSection === 'home' && <Home />}
          {activeSection === 'records' && <HallOfRecords />}
          {activeSection === 'champion' && <Champion />}
          {activeSection === 'constitution' && (
            <Constitution
              targetSubsection={targetSubsection}
              onSubsectionViewed={handleSubsectionViewed}
            />
          )}
          {activeSection === 'scouting' && <Scouting />}
          {activeSection === 'blog' && <Blog onNavigate={handleNavigate} />}
          {activeSection === 'teams' && <AllTeams />}
          {activeSection === 'trades' && <Trades />}
          {activeSection === 'previous-seasons' && <PreviousSeasons />}
        </MainContent>

        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
