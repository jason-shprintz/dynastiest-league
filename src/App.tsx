import { useState } from "react";
import GlobalStyles from "./GlobalStyles";
import { AppContainer, MainContent } from "./App.styles";
import Constitution from "./Components/Constitution/Constitution";
import Champion from "./Components/Champion/Champion";
import HallOfRecords from "./Components/HallOfRecords/HallOfRecords";
import Home from "./Components/MainContent/MainContent";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import Blog from "./Components/Blog/Blog";
import { Section } from "./types";

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
  const [activeSection, setActiveSection] = useState<Section>("home");

  return (
    <>
      <GlobalStyles />
      <AppContainer>
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <MainContent>
          {activeSection === "home" && <Home />}
          {activeSection === "records" && <HallOfRecords />}
          {activeSection === "champion" && <Champion />}
          {activeSection === "constitution" && <Constitution />}
          {activeSection === "blog" && <Blog />}
        </MainContent>

        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
