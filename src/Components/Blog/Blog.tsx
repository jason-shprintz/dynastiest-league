import { blogPosts } from "./data";
import {
  BlogSection,
  SectionDescription,
  BlogContent,
  BlogPostItem,
  PostDate,
  PostContent,
} from "./Blog.styles";
import renderContentWithLinks from "../../helper/renderContentWithLinks";

/**
 * Blog component that displays a list of blog posts for the Dynastiest League.
 *
 * Renders a section containing a header, description, and a list of blog posts
 * with their titles, dates, and content. Each post's content is processed to
 * render any embedded links.
 *
 * @returns A React component displaying the league blog with all posts
 */
const Blog = () => {
  return (
    <BlogSection>
      <h2>Commissioner's Blog</h2>
      <SectionDescription>Updates from the Commissioner</SectionDescription>
      <BlogContent>
        {blogPosts
          .sort((a, b) => (a.date > b.date ? -1 : 1))
          .map((post) => (
            <BlogPostItem key={post.id}>
              <h3>{post.title}</h3>
              <PostDate as="time" dateTime={post.date}>
                {post.date}
              </PostDate>
              <PostContent>{renderContentWithLinks(post.content)}</PostContent>
            </BlogPostItem>
          ))}
      </BlogContent>
    </BlogSection>
  );
};

export default Blog;
