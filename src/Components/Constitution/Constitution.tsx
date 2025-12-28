import { constitutionSections } from "./data";

const Constitution = () => {
  return (
    <section className="constitution-section">
      <h2>League Constitution</h2>
      <p className="section-description">
        Rules and regulations of the Dynastiest League
      </p>
      <div className="constitution-content">
        {constitutionSections.map((section, index) => (
          <div key={section.title} className="constitution-item">
            <h3>{section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Constitution;
