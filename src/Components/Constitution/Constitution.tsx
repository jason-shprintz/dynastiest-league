import { constitutionSections } from "./data";
import {
  ConstitutionSection,
  SectionDescription,
  ConstitutionContent,
  ConstitutionItem,
} from "./Constitution.styles";

// Helper to render text with clickable links
const renderContentWithLinks = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#ffd700", textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
};

const Constitution = () => {
  return (
    <ConstitutionSection>
      <h2>League Constitution</h2>
      <SectionDescription>
        Rules and regulations of the Dynastiest League
      </SectionDescription>
      <ConstitutionContent>
        {constitutionSections.map((section) => (
          <ConstitutionItem key={section.title}>
            <h3>{section.title}</h3>
            <p>{renderContentWithLinks(section.content)}</p>
          </ConstitutionItem>
        ))}
      </ConstitutionContent>
    </ConstitutionSection>
  );
};

export default Constitution;
