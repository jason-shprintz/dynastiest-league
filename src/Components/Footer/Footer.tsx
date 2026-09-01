import { Section } from '../../types';
import { isAnalyticsConsentRequired } from '../../helper/analytics-consent';
import { CONSENT_REOPEN_EVENT } from '../ConsentBanner/ConsentBanner';
import {
  FooterContainer,
  Copyright,
  FooterMeta,
  FooterLink,
  FooterButton,
  Separator,
  AppVersion,
} from './Footer.styles';

interface IFooterProps {
  onNavigate: (section: Section) => void;
}

/**
 * Renders the site footer with a copyright notice, a link to the privacy
 * policy, a control to revisit the cookie choice, and the current app version.
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
            if (
              event.metaKey ||
              event.ctrlKey ||
              event.shiftKey ||
              event.altKey ||
              event.button !== 0
            ) {
              return;
            }
            event.preventDefault();
            onNavigate('privacy');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Privacy
        </FooterLink>
        {/*
          Hidden entirely when consent is not required, rather than rendered
          as a control that opens nothing.
        */}
        {isAnalyticsConsentRequired() && (
          <>
            <Separator aria-hidden="true">·</Separator>
            <FooterButton
              type="button"
              onClick={() => {
                document.dispatchEvent(new CustomEvent(CONSENT_REOPEN_EVENT));
              }}
            >
              Cookie settings
            </FooterButton>
          </>
        )}
        <Separator aria-hidden="true">·</Separator>
        <AppVersion title="App version">v{__APP_VERSION__}</AppVersion>
      </FooterMeta>
    </FooterContainer>
  );
};

export default Footer;
