import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const BlogSection = styled.section`
  animation: fadeIn 0.5s ease-in;

  h2 {
    font-size: 2.5rem;
    color: ${COLORS.accent};
    margin-bottom: 0.5rem;
    text-align: center;

    @media (max-width: 480px) {
      font-size: 1.8rem;
    }
  }
`;

export const SectionDescription = styled.p`
  text-align: center;
  color: ${COLORS.textMuted};
  font-size: 1.1rem;
  margin-bottom: 2rem;

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

export const BlogContent = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const BlogPostItem = styled.div`
  background: rgba(15, 52, 96, 0.3);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid ${COLORS.accent};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(15, 52, 96, 0.5);
    transform: translateX(5px);
  }

  h3 {
    color: ${COLORS.accent};
    margin-bottom: 0.5rem;
    font-size: 1.3rem;

    @media (max-width: 768px) {
      font-size: 1.2rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1.25rem;
  }

  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

export const PostDate = styled.div`
  color: ${COLORS.textMuted};
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  font-style: italic;

  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

export const PostContent = styled.p`
  color: ${COLORS.textSecondary};
  line-height: 1.7;
  font-size: 1.05rem;
  white-space: pre-line;

  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;
