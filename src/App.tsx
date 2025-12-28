import { useState } from 'react'
import './App.css'

type Section = 'home' | 'records' | 'champion' | 'constitution'

interface ChampionRecord {
  year: string
  champion: string
  record: string
  points: number
}

interface CurrentChampion {
  team: string
  owner: string
  year: string
  record: string
  points: number
  playoffRun: string
}

interface ConstitutionSection {
  title: string
  content: string
}

function App() {
  const [activeSection, setActiveSection] = useState<Section>('home')

  // Sample data - can be replaced with real data later
  const hallOfRecords: ChampionRecord[] = [
    { year: '2023', champion: 'Team Thunder', record: '12-2', points: 1847 },
    { year: '2022', champion: 'Dynasty Kings', record: '11-3', points: 1789 },
    { year: '2021', champion: 'Grid Iron Giants', record: '10-4', points: 1723 },
    { year: '2020', champion: 'Team Thunder', record: '13-1', points: 1891 },
  ]

  const currentChampion: CurrentChampion = {
    team: 'Team Thunder',
    owner: 'Mike Johnson',
    year: '2023',
    record: '12-2',
    points: 1847,
    playoffRun: 'Won semifinals 145-132, Won finals 168-143'
  }

  const constitutionSections: ConstitutionSection[] = [
    {
      title: '1. League Structure',
      content: 'The Dynastiest League is a 10-team dynasty fantasy football league. Each team maintains a roster year-over-year with an annual rookie draft.'
    },
    {
      title: '2. Roster Settings',
      content: 'Starting lineup: 1 QB, 2 RB, 2 WR, 1 TE, 2 FLEX, 1 DEF. Bench spots: 15. IR spots: 2. Taxi squad: 3 rookies.'
    },
    {
      title: '3. Scoring System',
      content: 'PPR scoring (1 point per reception). Passing: 4 pts/TD, 0.04 pts/yard. Rushing/Receiving: 6 pts/TD, 0.1 pts/yard.'
    },
    {
      title: '4. Draft Rules',
      content: 'Annual rookie draft: 4 rounds, linear format. Draft order determined by inverse standings + playoff results. Trading draft picks is allowed up to 2 years in advance.'
    },
    {
      title: '5. Trading Policy',
      content: 'Trades allowed year-round. No trade deadline. Trade vetoes require 6+ votes. Commissioner reviews all trades for collusion.'
    },
    {
      title: '6. Playoffs',
      content: 'Top 6 teams make playoffs. Week 15-16: Semifinals. Week 17: Championship. Seeding by regular season record (weeks 1-14).'
    },
    {
      title: '7. Dues & Payouts',
      content: '$100 annual dues. Payouts: 1st place: $600, 2nd place: $300, 3rd place: $100. Regular season winner: $100 (paid separately).'
    }
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1 className="league-title">🏆 The Dynastiest League</h1>
          <p className="league-subtitle">Est. 2020 • Dynasty Fantasy Football</p>
        </div>
        <nav className="navigation">
          <button 
            className={`nav-btn ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => setActiveSection('home')}
          >
            Home
          </button>
          <button 
            className={`nav-btn ${activeSection === 'records' ? 'active' : ''}`}
            onClick={() => setActiveSection('records')}
          >
            Hall of Records
          </button>
          <button 
            className={`nav-btn ${activeSection === 'champion' ? 'active' : ''}`}
            onClick={() => setActiveSection('champion')}
          >
            Current Champion
          </button>
          <button 
            className={`nav-btn ${activeSection === 'constitution' ? 'active' : ''}`}
            onClick={() => setActiveSection('constitution')}
          >
            Constitution
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeSection === 'home' && (
          <section className="home-section">
            <div className="hero">
              <h2>Welcome to the Dynastiest League</h2>
              <p className="hero-text">
                Where champions are made and dynasties are built. This is more than just fantasy football—
                it's a legacy that spans seasons, a brotherhood of competition, and a pursuit of glory.
              </p>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">10</div>
                  <div className="stat-label">Teams</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">4</div>
                  <div className="stat-label">Seasons</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">$1,000</div>
                  <div className="stat-label">Annual Prize Pool</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'records' && (
          <section className="records-section">
            <h2>Hall of Records</h2>
            <p className="section-description">Champions throughout the years</p>
            <div className="records-table">
              <div className="table-header">
                <div>Year</div>
                <div>Champion</div>
                <div>Record</div>
                <div>Points</div>
              </div>
              {hallOfRecords.map((record) => (
                <div key={record.year} className="table-row">
                  <div className="year">{record.year}</div>
                  <div className="champion-name">{record.champion}</div>
                  <div className="record">{record.record}</div>
                  <div className="points">{record.points}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeSection === 'champion' && (
          <section className="champion-section">
            <div className="champion-card">
              <div className="champion-badge">👑 Reigning Champion</div>
              <h2 className="champion-team">{currentChampion.team}</h2>
              <p className="champion-owner">Owner: {currentChampion.owner}</p>
              <div className="champion-stats">
                <div className="champion-stat">
                  <span className="label">Championship Year:</span>
                  <span className="value">{currentChampion.year}</span>
                </div>
                <div className="champion-stat">
                  <span className="label">Regular Season:</span>
                  <span className="value">{currentChampion.record}</span>
                </div>
                <div className="champion-stat">
                  <span className="label">Total Points:</span>
                  <span className="value">{currentChampion.points}</span>
                </div>
              </div>
              <div className="playoff-run">
                <h3>Championship Run</h3>
                <p>{currentChampion.playoffRun}</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'constitution' && (
          <section className="constitution-section">
            <h2>League Constitution</h2>
            <p className="section-description">Rules and regulations of the Dynastiest League</p>
            <div className="constitution-content">
              {constitutionSections.map((section, index) => (
                <div key={index} className="constitution-item">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>&copy; 2020-{new Date().getFullYear()} The Dynastiest League. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
