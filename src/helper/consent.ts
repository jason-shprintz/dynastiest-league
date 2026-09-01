/**
 * Analytics consent: the visitor's recorded choice, and the bridge to Zaraz.
 *
 * Consent is stored in a first-party cookie rather than localStorage so it
 * survives alongside Zaraz's own record and is readable synchronously on the
 * first paint, which keeps the banner from flashing for visitors who already
 * answered.
 *
 * Ported from the portfolio's src/lib/analytics-client.ts, including the two
 * traps documented below — both were found the hard way there.
 */

export const ANALYTICS_CONSENT_COOKIE = 'analytics-consent';

/** One year, the usual ceiling for a consent record before re-prompting. */
export const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentValue = 'granted' | 'denied';

/**
 * `null` means the visitor has not chosen yet, which is distinct from
 * 'denied'. The banner opens on `null` only — a recorded refusal is an answer
 * and must not be re-asked on every visit.
 */
export type ConsentState = ConsentValue | 'not-required' | null;

/** Vite inlines `import.meta.env.*` at build time. */
export const isConsentRequired = (): boolean =>
  import.meta.env.VITE_ANALYTICS_REQUIRE_CONSENT === '1';

const parseConsentValue = (
  raw: string | null | undefined,
): ConsentValue | null =>
  raw === 'granted' || raw === 'denied' ? raw : null;

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
 * always what actually ships, so both are checked.
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
 * answered — on a fresh session with one purpose it returns
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
 * the banner; 'not-required' means the feature flag is off.
 */
export const readConsent = (): ConsentState => {
  if (!isConsentRequired() || typeof window === 'undefined') {
    return 'not-required';
  }
  return readConsentCookie();
};

/** Records the choice locally and hands it to Zaraz. */
export const writeConsent = (granted: boolean): void => {
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
