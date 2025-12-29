import { constitutionSections } from "./data";
import {
  ConstitutionSection,
  SectionDescription,
  ConstitutionContent,
  ConstitutionItem,
} from "./Constitution.styles";
import renderContentWithLinks from "../../helper/renderContentWithLinks";

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
