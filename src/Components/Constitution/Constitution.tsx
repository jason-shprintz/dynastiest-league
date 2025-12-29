import { constitutionSections } from "./data";
import {
  ConstitutionSection,
  SectionDescription,
  ConstitutionContent,
  ConstitutionItem,
} from "./Constitution.styles";
import renderContentWithLinks from "../../helper/renderContentWithLinks";

/**
 * Constitution component that displays the league's rules and regulations.
 *
 * Renders a structured view of the Dynastiest League constitution,
 * iterating through predefined constitution sections and displaying
 * each section's title and content with clickable links.
 *
 * @returns A React component containing the formatted league constitution
 */
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
