import { useEffect } from 'react';
import { blogPosts } from './data';
import {
  BlogSection,
  SectionDescription,
  BlogContent,
  BlogPostItem,
  PostDate,
  PostContent,
} from './Blog.styles';
import renderContentWithLinks from '../../helper/renderContentWithLinks';
import { NavigationTarget } from '../../types';

interface IBlogProps {
  onNavigate?: (target: NavigationTarget) => void;
}

/**
 * Blog component that displays a list of blog posts for the Dynastiest League.
 *
 * Renders a section containing a header, description, and a list of blog posts
 * with their titles, dates, and content. Each post's content is processed to
 * render any embedded links. Injects BlogPosting JSON-LD structured data for
 * each post to improve AI engine and search crawler visibility.
 *
 * @param props - The component props
 * @param props.onNavigate - Optional callback function to handle internal navigation
 * @returns A React component displaying the league blog with all posts
 */
const Blog = ({ onNavigate }: IBlogProps) => {
  useEffect(() => {
    const schemaId = 'blog-jsonld';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const blogSchema = {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: "Commissioner's Blog",
      url: 'https://dynastiestleague.com/#blog',
      publisher: {
        '@type': 'Organization',
        name: 'The Dynastiest League',
      },
      blogPost: blogPosts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.title,
        datePublished: post.date,
        url: `https://dynastiestleague.com/#blog`,
        publisher: {
          '@type': 'Organization',
          name: 'The Dynastiest League',
        },
      })),
    };

    script.textContent = JSON.stringify(blogSchema);

    return () => {
      document.getElementById(schemaId)?.remove();
    };
  }, []);

  return (
    <BlogSection>
      <h2>Commissioner's Blog</h2>
      <SectionDescription>Updates from the Commissioner</SectionDescription>
      <BlogContent>
        {blogPosts
          .sort((a, b) => {
            const aTime = new Date(a.date).getTime();
            const bTime = new Date(b.date).getTime();

            if (aTime === bTime) {
              return 0;
            }

            // Newest posts first
            return bTime - aTime;
          })
          .map((post) => (
            <BlogPostItem key={post.id}>
              <h3>{post.title}</h3>
              <PostDate as="time" dateTime={post.date}>
                {post.date}
              </PostDate>
              <PostContent>
                {renderContentWithLinks(post.content, onNavigate)}
              </PostContent>
            </BlogPostItem>
          ))}
      </BlogContent>
    </BlogSection>
  );
};

export default Blog;
