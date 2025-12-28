const MainContent = () => {
  return (
    <section className="home-section">
      <div className="hero">
        <h2>Welcome to the Dynastiest League</h2>
        <p className="hero-text">
          Where champions are made and dynasties are built. This is more than
          just fantasy football— it's a legacy that spans seasons, a brotherhood
          of competition, and a pursuit of glory.
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
  );
};

export default MainContent;
