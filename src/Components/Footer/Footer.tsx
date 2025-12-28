import { FooterContainer } from "./Footer.styles";

/**
 * Renders the site footer with a copyright notice for The Dynastiest League.
 *
 * The ending year is computed dynamically from the current date, producing a
 * range like `2020-YYYY`.
 *
 * @returns A footer element containing the copyright text.
 */
const Footer = () => {
  return (
    <FooterContainer>
      <p>
        &copy; 2020-{new Date().getFullYear()} The Dynastiest League. All rights
        reserved.
      </p>
    </FooterContainer>
  );
};

export default Footer;
