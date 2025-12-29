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
