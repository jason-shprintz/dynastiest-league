import { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import GlobalStyles from './GlobalStyles';
import { AppContainer, MainContent, SectionFallback } from './App.styles';
import Footer from './Components/Footer/Footer';
import Header from './Components/Header/Header';
import Home from './Components/MainContent/MainContent';
import { LoadingSpinner } from './theme/shared.styles';
import { NavigationTarget, Section } from './types';
import usePageMeta from './hooks/usePageMeta';
import { isValidSection } from './constants';

/**
 * Every section other than the home page is code-split. Only one section is
 * ever mounted at a time, so eagerly importing all ten pushed roughly 36 KiB of
 * unused JavaScript into the initial bundle and blocked the main thread during
 * startup. `Home` stays eager because it is the default route and contains the
 * largest contentful paint.
 */
const AllTeams = lazy(() => import('./Components/AllTeams/AllTeams'));
const Blog = lazy(() => import('./Components/Blog/Blog'));
const Champion = lazy(() => import('./Components/Champion/Champion'));
const Constitution = lazy(
  () => import('./Components/Constitution/Constitution'),
);
const Draft = lazy(() => import('./Components/Draft/Draft'));
const HallOfRecords = lazy(
  () => import('./Components/HallOfRecords/HallOfRecords'),
);
const NotFound = lazy(() => import('./Components/NotFound/NotFound'));
const PreviousSeasons = lazy(
  () => import('./Components/PreviousSeasons/PreviousSeasons'),
);
const Privacy = lazy(() => import('./Components/Privacy/Privacy'));
const Scouting = lazy(() => import('./Components/Scouting/Scouting'));
const Trades = lazy(() => import('./Components/Trades/Trades'));

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

/**
 * Parses `window.location.hash` into a validated section and an optional
 * subsection. Supports both plain hashes (`#blog`) and compound hashes
 * (`#constitution/unsportsmanlike-conduct`).
 *
 * An absent hash means the home page. A hash that is present but names no
 * known section is an error rather than a synonym for home — previously both
 * collapsed to `home`, so a mistyped or dead link silently rendered the
 * landing page and looked like it had worked.
 */
const parseHash = (): { section: Section; subsection?: string } => {
  const hash = window.location.hash.replace('#', '');

  if (!hash) {
    return { section: 'home' };
  }

  const [sectionPart, subsectionPart] = hash.split('/');
  const section: Section = isValidSection(sectionPart)
    ? sectionPart
    : 'not-found';

  return { section, subsection: subsectionPart || undefined };
};

function App() {
  const { section: initialSectionValue, subsection: initialSubsection } =
    parseHash();

  const [activeSection, setActiveSection] =
    useState<Section>(initialSectionValue);
  const [targetSubsection, setTargetSubsection] = useState<string | undefined>(
    initialSubsection,
  );

  // Sync URL hash whenever the active section changes
  useEffect(() => {
    // The not-found section has no hash of its own, and rewriting the address
    // bar to `#not-found` would destroy the very thing the visitor needs to
    // see: what they actually asked for. Leave the bad hash in place so it can
    // be read, corrected, or reported.
    if (activeSection === 'not-found') {
      return;
    }

    const newHash = activeSection === 'home' ? '' : `#${activeSection}`;
    if (window.location.hash !== newHash) {
      const newUrl = newHash
        ? newHash
        : `${window.location.pathname}${window.location.search}`;
      window.history.pushState(null, '', newUrl);
    }
  }, [activeSection]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const { section, subsection } = parseHash();
      setActiveSection(section);
      setTargetSubsection(subsection);
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
          <Suspense
            fallback={
              <SectionFallback role="status" aria-live="polite">
                <LoadingSpinner aria-hidden="true" />
                <span>Loading…</span>
              </SectionFallback>
            }
          >
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
            {activeSection === 'draft' && <Draft />}
            {activeSection === 'previous-seasons' && <PreviousSeasons />}
            {activeSection === 'privacy' && <Privacy />}
            {activeSection === 'not-found' && (
              <NotFound onNavigate={handleSectionChange} />
            )}
          </Suspense>
        </MainContent>

        <Footer onNavigate={handleSectionChange} />
      </AppContainer>
    </>
  );
}

export default App;
