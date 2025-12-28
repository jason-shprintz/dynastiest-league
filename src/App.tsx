import { useState } from "react";
import GlobalStyles from "./GlobalStyles";
import { AppContainer, MainContent } from "./App.styles";
import Constitution from "./Components/Constitution/Constitution";
import Champion from "./Components/Champion/Champion";
import HallOfRecords from "./Components/HallOfRecords/HallOfRecords";
import Home from "./Components/MainContent/MainContent";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import { Section } from "./types";

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
        </MainContent>

        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
