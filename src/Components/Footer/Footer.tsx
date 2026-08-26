import { Section } from '../../types';
import {
  FooterContainer,
  Copyright,
  FooterMeta,
  FooterLink,
  Separator,
  AppVersion,
} from './Footer.styles';

interface IFooterProps {
  onNavigate: (section: Section) => void;
}

/**
 * Renders the site footer with a copyright notice, a link to the privacy
 * policy, and the current app version.
 *
 * The ending year is computed dynamically from the current date, producing a
 * range like `2020-YYYY`.
 *
 * @param props - The component props
 * @param props.onNavigate - Callback used to route to the privacy section
 * @returns A footer element
 */
const Footer = ({ onNavigate }: IFooterProps) => {
  return (
    <FooterContainer>
      <Copyright>
        &copy; 2020-{new Date().getFullYear()} The Dynastiest League. All rights
        reserved.
      </Copyright>
      <FooterMeta>
        {/*
          A real href so the link can be opened in a new tab, copied, or
          crawled; the click handler routes in-app instead of relying on the
          hashchange round trip.
        */}
        <FooterLink
          href="#privacy"
          onClick={(event) => {
            event.preventDefault();
            onNavigate('privacy');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Privacy
        </FooterLink>
        <Separator aria-hidden="true">·</Separator>
        <AppVersion title="App version">v{__APP_VERSION__}</AppVersion>
      </FooterMeta>
    </FooterContainer>
  );
};

export default Footer;
