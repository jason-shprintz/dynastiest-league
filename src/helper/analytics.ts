/**
 * Thin wrapper over the Cloudflare Zaraz Web API, plus the consent gate.
 *
 * Zaraz is only present on the production zone (dynastiestleague.com), where it
 * is injected into the response at Cloudflare's edge. Locally, on *.pages.dev
 * previews, and for any visitor running a content blocker, `window.zaraz` is
 * undefined, so every call here degrades to a no-op rather than throwing. In
 * dev the no-op logs instead, which makes it possible to verify that call sites
 * fire at the right moment without a live tag.
 */

import {
  ANALYTICS_CONSENT_COOKIE,
  ANALYTICS_CONSENT_MAX_AGE_SECONDS,
  isAnalyticsConsentRequired,
  parseConsentValue,
  type ConsentState,
  type ConsentValue,
} from './analytics-consent';

const isDev = import.meta.env.DEV;

const getZaraz = (): Zaraz | undefined =>
  typeof window === 'undefined' ? undefined : window.zaraz;

// The consent cookie is deliberately readable by script: the banner has to
// read it to know whether to show, and write it when clicked.

const cookieExists = (name: string): boolean => {
  if (typeof document === 'undefined') return false;

  const prefix = `${name}=`;
  return document.cookie
    .split(';')
    .some((part) => part.trim().startsWith(prefix));
};

/**
 * Cookie names Zaraz has been seen to use for its own consent record. The name
 * is configurable per zone and the documented default (`cf_consent`) is not
 * always what ships - alleyadmin.app writes `zaraz-consent` - so both are
 * checked.
 *
 * Only PRESENCE is ever checked. The contents are an undocumented format keyed
 * by per-zone random purpose IDs and must not be parsed.
 */
const ZARAZ_CONSENT_COOKIES = ['cf_consent', 'zaraz-consent'];

/**
 * Whether Zaraz has already recorded a consent choice for this visitor.
 *
 * Do NOT reimplement this with `zaraz.consent.getAll()`. That returns the
 * status of every CONFIGURED purpose regardless of whether the visitor has
 * answered - on a fresh session with one purpose it returns
 * `{ <purposeId>: false }`. Counting its keys therefore reports "answered" for
 * every visitor alive and permanently suppresses the banner. Cloudflare's own
 * documented example checks the consent cookie for exactly this reason.
 */
export const hasZarazConsentRecord = (): boolean =>
  ZARAZ_CONSENT_COOKIES.some(cookieExists);

const readConsentCookie = (): ConsentValue | null => {
  if (typeof document === 'undefined') return null;

  const prefix = `${ANALYTICS_CONSENT_COOKIE}=`;
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!entry) return null;

  try {
    return parseConsentValue(decodeURIComponent(entry.slice(prefix.length)));
  } catch {
    return null;
  }
};

const writeConsentCookie = (value: ConsentValue): void => {
  // Secure is conditional so the cookie still sets on http://localhost during
  // `npm run dev`; production is HTTPS-only and always gets it.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${ANALYTICS_CONSENT_COOKIE}=${value}; Path=/; ` +
    `Max-Age=${ANALYTICS_CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
};

/**
 * The visitor's recorded choice. `null` means unanswered, which is what opens
 * the banner; 'not-required' means the build flag is off.
 */
export const readAnalyticsConsent = (): ConsentState => {
  if (!isAnalyticsConsentRequired() || typeof window === 'undefined') {
    return 'not-required';
  }
  return readConsentCookie();
};

/** Records the choice locally and hands it to Zaraz. */
export const setAnalyticsConsent = (granted: boolean): void => {
  if (typeof window === 'undefined') return;

  try {
    writeConsentCookie(granted ? 'granted' : 'denied');
  } catch {
    // Cookies disabled entirely; nothing useful to do.
  }

  // Zaraz keeps its own consent state for the tools it loads. Without this it
  // would keep sending to GA4 regardless of the cookie written above.
  try {
    window.zaraz?.consent?.setAll?.(granted);
  } catch {
    // no-op
  }

  if (!granted) return;

  // Zaraz withholds events while consent is unanswered. On this SPA that is
  // the initial Pageview plus a spaPageview for every section browsed before
  // answering; without this flush they are all dropped.
  try {
    window.zaraz?.consent?.sendQueuedEvents?.();
  } catch {
    // no-op
  }
};

/**
 * Whether analytics calls may proceed.
 *
 * When the flag is off this is always true and nothing changes. When it is on,
 * only an explicit grant passes: `null` (unanswered) is treated as refusal,
 * because pre-consent is exactly when the tag must not fire.
 *
 * This duplicates the gate Zaraz already applies via purpose assignment, on
 * purpose. If the GA4 tool is ever left on "Skip Consent" in the dashboard,
 * Zaraz would happily send anyway; this check means the app does not depend on
 * that setting being correct.
 */
const mayTrack = (): boolean => {
  const consent = readAnalyticsConsent();
  return consent === 'not-required' || consent === 'granted';
};

/**
 * Reports a client-side navigation as a GA4 pageview.
 *
 * Call this only *after* `document.title` has been updated, since Zaraz reads
 * the title and URL off the document at call time.
 */
export const trackPageview = (): void => {
  if (!mayTrack()) return;

  const zaraz = getZaraz();

  // Checks the method rather than the object: Zaraz's early inline stub
  // defines `zaraz` with a queued `track` before the main script loads, but
  // `spaPageview` is not part of that stub, so a plain `if (window.zaraz)`
  // check can pass while the call still fails.
  if (typeof zaraz?.spaPageview !== 'function') {
    if (isDev && typeof window !== 'undefined') {
      console.debug(
        '[analytics] pageview (no-op):',
        document.title,
        window.location.href,
      );
    }
    return;
  }

  zaraz.spaPageview();
};

/** Sends a custom event. Property values must be primitives. */
export const trackEvent = (
  eventName: string,
  properties?: ZarazEventProperties,
): void => {
  if (!mayTrack()) return;

  const zaraz = getZaraz();

  if (typeof zaraz?.track !== 'function') {
    if (isDev) {
      console.debug('[analytics] event (no-op):', eventName, properties);
    }
    return;
  }

  zaraz.track(eventName, properties);
};
