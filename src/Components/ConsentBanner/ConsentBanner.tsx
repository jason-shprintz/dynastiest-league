import { useCallback, useEffect, useState } from 'react';
import {
  hasZarazConsentRecord,
  isConsentRequired,
  readConsent,
  writeConsent,
} from '../../helper/consent';
import {
  BannerContainer,
  BannerInner,
  BannerText,
  BannerTitle,
  BannerBody,
  BannerLink,
  BannerActions,
  ConsentButton,
} from './ConsentBanner.styles';

/**
 * Custom DOM event the footer dispatches to re-open this banner.
 *
 * The banner is mounted next to <App /> in main.tsx rather than inside it, so
 * that a document-level overlay does not have to be threaded through the
 * section-routing tree. That puts it outside the footer's React tree, so a
 * DOM event is the connection rather than a prop.
 */
export const CONSENT_REOPEN_EVENT = 'consent:reopen';

/**
 * Replaces the stock Cloudflare Zaraz consent modal.
 *
 * Requires "Show consent modal" to be DISABLED in the Zaraz dashboard while
 * "Enable Consent Management" stays ENABLED — otherwise this banner and the
 * Zaraz modal both appear.
 *
 * Opens only when the visitor has not answered. A recorded refusal is an
 * answer and does not bring it back; the footer's "Cookie settings" link
 * re-opens it so a choice can be withdrawn as easily as it was given.
 *
 * @returns The consent banner, or null when there is nothing to ask
 */
const ConsentBanner = () => {
  const [isOpen, setIsOpen] = useState(() => readConsent() === null);

  const choose = useCallback((granted: boolean) => {
    writeConsent(granted);
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isConsentRequired()) return;

    const open = () => setIsOpen(true);

    /**
     * Close for a returning visitor who answered Zaraz's own modal before this
     * banner shipped, or who answered in another tab.
     *
     * Checks for Zaraz's consent COOKIE rather than counting the keys of
     * `zaraz.consent.getAll()` — getAll() returns an entry for every
     * configured purpose whether or not the visitor answered, so counting its
     * keys hides the banner from everybody.
     */
    const closeIfAnswered = () => {
      if (readConsent() !== null || hasZarazConsentRecord()) {
        setIsOpen(false);
      }
    };

    document.addEventListener(CONSENT_REOPEN_EVENT, open);
    document.addEventListener('zarazConsentAPIReady', closeIfAnswered, {
      once: true,
    });
    document.addEventListener('zarazConsentChoicesUpdated', closeIfAnswered);

    return () => {
      document.removeEventListener(CONSENT_REOPEN_EVENT, open);
      document.removeEventListener('zarazConsentAPIReady', closeIfAnswered);
      document.removeEventListener(
        'zarazConsentChoicesUpdated',
        closeIfAnswered,
      );
    };
  }, []);

  if (!isOpen) return null;

  return (
    <BannerContainer
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-banner-title"
      aria-describedby="consent-banner-body"
    >
      <BannerInner>
        <BannerText>
          <BannerTitle id="consent-banner-title">
            Cookies for analytics
          </BannerTitle>
          <BannerBody id="consent-banner-body">
            This site uses Google Analytics to count visits and see which
            sections people open. Nothing is sold, and there are no ad trackers.
            Decline and the site works exactly the same.{' '}
            <BannerLink
              type="button"
              onClick={() => {
                window.location.hash = '#privacy';
              }}
            >
              Privacy policy
            </BannerLink>
          </BannerBody>
        </BannerText>
        <BannerActions>
          <ConsentButton type="button" onClick={() => choose(false)}>
            Decline
          </ConsentButton>
          <ConsentButton type="button" onClick={() => choose(true)}>
            Accept
          </ConsentButton>
        </BannerActions>
      </BannerInner>
    </BannerContainer>
  );
};

export default ConsentBanner;
