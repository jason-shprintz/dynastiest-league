import { COLORS } from "../theme/colors";
import { TextHighlight } from "../Components/Blog/Blog.styles";
import { NavigationTarget, Section } from "../types";

// Helper to validate URLs and ensure only http/https protocols
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

// Valid section values
// Note: This list must be kept in sync with the Section type in types.ts
// TypeScript doesn't support runtime introspection of union types
const VALID_SECTIONS: readonly Section[] = [
  "home",
  "records",
  "champion",
  "constitution",
  "scouting",
  "blog",
  "teams",
  "trades",
] as const;

// Helper to validate if a string is a valid Section
const isValidSection = (value: string): value is Section => {
  return (VALID_SECTIONS as readonly string[]).includes(value);
};

// Type for navigation callback that supports both section and subsection
type NavigationCallback = (target: NavigationTarget) => void;

/**
 * Renders a string segment with URLs automatically converted to clickable links
 * and NavLink tags converted to internal navigation links.
 * Supports optional subsection attribute for deep linking within sections.
 */
const renderLinks = (
  content: string,
  keyPrefix: string,
  onNavigate?: NavigationCallback,
): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  // Updated regex to support optional subsection attribute
  const navLinkRegex =
    /<NavLink section="([^"]+)"(?:\s+subsection="([^"]+)")?>([\s\S]+?)<\/NavLink>/g;
  let lastIndex = 0;
  let match;

  // First, process NavLink tags
  const processedParts: {
    type: "text" | "navlink";
    content: string;
    section?: Section;
    subsection?: string;
  }[] = [];

  while ((match = navLinkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      processedParts.push({
        type: "text",
        content: content.slice(lastIndex, match.index),
      });
    }
    
    const sectionValue = match[1];
    if (!isValidSection(sectionValue)) {
      console.warn(
        `[renderContentWithLinks] Invalid section "${sectionValue}" in NavLink tag. Valid sections are: ${VALID_SECTIONS.join(", ")}`,
      );
      // Treat invalid section as plain text (use inner text, not raw tag)
      processedParts.push({
        type: "text",
        content: match[3],
      });
    } else {
      processedParts.push({
        type: "navlink",
        content: match[3],
        section: sectionValue,
        subsection: match[2],
      });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    processedParts.push({ type: "text", content: content.slice(lastIndex) });
  }

  // If no NavLinks were found, just process URLs
  if (processedParts.length === 0) {
    processedParts.push({ type: "text", content });
  }

  // Process each part
  processedParts.forEach((part, partIndex) => {
    if (part.type === "navlink" && part.section) {
      elements.push(
        <a
          key={`${keyPrefix}-navlink-${partIndex}`}
          href={`#${part.section}`}
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.({
              section: part.section!,
              subsection: part.subsection,
            });
          }}
          style={{
            color: COLORS.accent,
            textDecoration: "underline",
            cursor: "pointer",
          }}
          aria-label={`Navigate to ${part.content}`}
        >
          {part.content}
        </a>,
      );
    } else {
      // Process URLs in text content
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const urlParts = part.content.split(urlRegex);
      urlParts.forEach((urlPart, urlIndex) => {
        if (urlIndex % 2 === 1 && isValidUrl(urlPart)) {
          elements.push(
            <a
              key={`${keyPrefix}-link-${partIndex}-${urlIndex}`}
              href={urlPart}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.accent, textDecoration: "underline" }}
              aria-label={`${urlPart} (opens in a new tab)`}
            >
              {urlPart}
            </a>,
          );
        } else {
          elements.push(
            <span key={`${keyPrefix}-text-${partIndex}-${urlIndex}`}>
              {urlPart}
            </span>,
          );
        }
      });
    }
  });

  return elements;
};

/**
 * Renders a string content with URLs automatically converted to clickable links
 * and <TextHighlight> tags converted to styled highlights.
 *
 * @param content - The string content that may contain URLs and TextHighlight tags.
 * @returns An array of React elements where URLs are rendered as anchor tags,
 *          TextHighlight tags are rendered with accent styling, and plain text as spans.
 *
 * @example
 * ```tsx
 * const text = "Check out https://example.com and <TextHighlight>important info</TextHighlight>";
 * return <p>{renderContentWithLinks(text)}</p>;
 * ```
 */
const renderContentWithLinks = (
  content: string,
  onNavigate?: NavigationCallback,
) => {
  const highlightRegex = /<TextHighlight>(.*?)<\/TextHighlight>/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = highlightRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      elements.push(
        ...renderLinks(textBefore, `before-${match.index}`, onNavigate),
      );
    }

    // Add the highlighted text
    elements.push(
      <TextHighlight key={`highlight-${match.index}`}>
        {renderLinks(match[1], `highlight-content-${match.index}`, onNavigate)}
      </TextHighlight>,
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    elements.push(...renderLinks(textAfter, `after-${lastIndex}`, onNavigate));
  }

  return elements;
};

export default renderContentWithLinks;
