import { hallOfRecords } from "./data";

const HallOfRecords = () => {
  return (
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
  );
};

export default HallOfRecords;
