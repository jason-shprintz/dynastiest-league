import { Section } from "../../types";

interface IHeaderProps {
  activeSection: Section;
  setActiveSection: React.Dispatch<React.SetStateAction<Section>>;
}

const Header = ({ activeSection, setActiveSection }: IHeaderProps) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="league-title">🏆 The Dynastiest League</h1>
        <p className="league-subtitle">Est. 2020 • Dynasty Fantasy Football</p>
      </div>
      <nav className="navigation">
        <button
          className={`nav-btn ${activeSection === "home" ? "active" : ""}`}
          onClick={() => setActiveSection("home")}
        >
          Home
        </button>
        <button
          className={`nav-btn ${activeSection === "records" ? "active" : ""}`}
          onClick={() => setActiveSection("records")}
        >
          Hall of Records
        </button>
        <button
          className={`nav-btn ${activeSection === "champion" ? "active" : ""}`}
          onClick={() => setActiveSection("champion")}
        >
          Current Champion
        </button>
        <button
          className={`nav-btn ${
            activeSection === "constitution" ? "active" : ""
          }`}
          onClick={() => setActiveSection("constitution")}
        >
          Constitution
        </button>
      </nav>
    </header>
  );
};

export default Header;
