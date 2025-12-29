import { COLORS } from "../theme/colors";

const urlRegex = /(https?:\/\/[^\s]+)/g;

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
 * Renders a string content with URLs automatically converted to clickable links.
 *
 * @param content - The string content that may contain URLs to be converted to links.
 * @returns An array of React elements where URLs are rendered as anchor tags with
 *          accent color styling, and non-URL text is rendered as plain spans.
 *
 * @example
 * ```tsx
 * const text = "Check out https://example.com for more info";
 * return <p>{renderContentWithLinks(text)}</p>;
 * ```
 */
const renderContentWithLinks = (content: string) => {
  const parts = content.split(urlRegex);
  return parts.map((part, index) =>
    index % 2 === 1 && isValidUrl(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: COLORS.accent, textDecoration: "underline" }}
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

export default renderContentWithLinks;
