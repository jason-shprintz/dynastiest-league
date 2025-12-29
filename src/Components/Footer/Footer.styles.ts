import styled from "styled-components";
import { COLORS } from "../../theme/colors";

export const FooterContainer = styled.footer`
  background: rgba(0, 0, 0, 0.4);
  border-top: 2px solid ${COLORS.secondary};
  padding: 1.5rem;
  text-align: center;
  color: ${COLORS.textMuted};
`;
