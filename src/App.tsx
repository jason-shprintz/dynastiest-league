import { useState } from "react";
import "./App.css";
import Constitution from "./Components/Constitution/Constitution";
import Champion from "./Components/Champion/Champion";
import HallOfRecords from "./Components/HallOfRecords/HallOfRecords";
import MainContent from "./Components/MainContent/MainContent";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import { Section } from "./types";

function App() {
  const [activeSection, setActiveSection] = useState<Section>("home");

  return (
    <div className="app">
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <main className="main-content">
        {activeSection === "home" && <MainContent />}
        {activeSection === "records" && <HallOfRecords />}
        {activeSection === "champion" && <Champion />}
        {activeSection === "constitution" && <Constitution />}
      </main>

      <Footer />
    </div>
  );
}

export default App;
