import { blogPosts } from "./data";
import {
  BlogSection,
  SectionDescription,
  BlogContent,
  BlogPostItem,
  PostDate,
  PostContent,
} from "./Blog.styles";
import { COLORS } from "../../theme/colors";

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

// Helper to render text with clickable links
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

const Blog = () => {
  return (
    <BlogSection>
      <h2>League Blog</h2>
      <SectionDescription>
        Updates, insights, and stories from the Dynastiest League
      </SectionDescription>
      <BlogContent>
        {blogPosts.map((post) => (
          <BlogPostItem key={post.id}>
            <h3>{post.title}</h3>
            <PostDate>{post.date}</PostDate>
            <PostContent>{renderContentWithLinks(post.content)}</PostContent>
          </BlogPostItem>
        ))}
      </BlogContent>
    </BlogSection>
  );
};

export default Blog;
