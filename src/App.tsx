import { useState, useCallback } from 'react';
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
function App() {
  const [activeSection, setActiveSection] = useState<Section>('home');
  const [targetSubsection, setTargetSubsection] = useState<string | undefined>(
    undefined,
  );

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
