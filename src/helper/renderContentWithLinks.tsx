import { COLORS } from "../theme/colors";
import { TextHighlight } from "../Components/Blog/Blog.styles";

// Helper to validate URLs and ensure only http/https protocols
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

/**
 * Renders a string segment with URLs automatically converted to clickable links.
 */
const renderLinks = (content: string, keyPrefix: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, index) =>
    index % 2 === 1 && isValidUrl(part) ? (
      <a
        key={`${keyPrefix}-link-${index}`}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: COLORS.accent, textDecoration: "underline" }}
        aria-label={`${part} (opens in a new tab)`}
      >
        {part}
      </a>
    ) : (
      <span key={`${keyPrefix}-text-${index}`}>{part}</span>
    )
  );
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
const renderContentWithLinks = (content: string) => {
  const highlightRegex = /<TextHighlight>(.*?)<\/TextHighlight>/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = highlightRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      elements.push(...renderLinks(textBefore, `before-${match.index}`));
    }

    // Add the highlighted text
    elements.push(
      <TextHighlight key={`highlight-${match.index}`}>
        {renderLinks(match[1], `highlight-content-${match.index}`)}
      </TextHighlight>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last match
  if (lastIndex < content.length) {
    const textAfter = content.slice(lastIndex);
    elements.push(...renderLinks(textAfter, `after-${lastIndex}`));
  }

  return elements;
};

export default renderContentWithLinks;
