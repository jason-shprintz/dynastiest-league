import { useEffect, useRef } from "react";
import { constitutionSections } from "./data";
import {
  ConstitutionSection,
  SectionDescription,
  ConstitutionContent,
  ConstitutionItem,
} from "./Constitution.styles";
import renderContentWithLinks from "../../helper/renderContentWithLinks";

interface IConstitutionProps {
  targetSubsection?: string;
  onSubsectionViewed?: () => void;
}

/**
 * Constitution component that displays the league's rules and regulations.
 *
 * Renders a structured view of the Dynastiest League constitution,
 * iterating through predefined constitution sections and displaying
 * each section's title and content with clickable links.
 *
 * @param props - The component props
 * @param props.targetSubsection - Optional ID of a subsection to scroll to
 * @param props.onSubsectionViewed - Callback when subsection has been scrolled to
 * @returns A React component containing the formatted league constitution
 */
const Constitution = ({
  targetSubsection,
  onSubsectionViewed,
}: IConstitutionProps) => {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    let animationFrameId: number | undefined;

    if (targetSubsection && sectionRefs.current[targetSubsection]) {
      // Use requestAnimationFrame to ensure the DOM has been painted before scrolling
      animationFrameId = window.requestAnimationFrame(() => {
        sectionRefs.current[targetSubsection]?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        // Clear the target after scrolling
        onSubsectionViewed?.();
      });
    }

    return () => {
      if (animationFrameId !== undefined) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetSubsection, onSubsectionViewed]);

  return (
    <ConstitutionSection>
      <h2>League Constitution</h2>
      <SectionDescription>
        Rules and regulations of the Dynastiest League
      </SectionDescription>
      <ConstitutionContent>
        {constitutionSections.map((section) => (
          <ConstitutionItem
            key={section.id}
            ref={(el) => {
              sectionRefs.current[section.id] = el;
            }}
            id={section.id}
          >
            <h3>{section.title}</h3>
            <p>{renderContentWithLinks(section.content)}</p>
          </ConstitutionItem>
        ))}
      </ConstitutionContent>
    </ConstitutionSection>
  );
};

export default Constitution;
