/**
 * Ambient types for the Cloudflare Zaraz Web API.
 *
 * Zaraz is injected into the response at Cloudflare's edge rather than bundled,
 * so `window.zaraz` has no package to type it and is optional at runtime — it
 * is absent in local dev, on *.pages.dev previews, and for any visitor running
 * a content blocker. Every consumer must feature-detect.
 *
 * This file deliberately has no top-level import or export. `tsconfig.json`
 * sets `moduleDetection: "force"`, but that applies only to non-declaration
 * files, so a `.d.ts` is still treated as a global script and `Window` below
 * merges with the DOM lib rather than shadowing it.
 */

interface ZarazEventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

interface ZarazConsent {
  /** True once Zaraz's consent API has finished initialising. */
  APIReady?: boolean;
  /** Grants or denies every configured purpose at once. */
  setAll?: (value: boolean) => void;
  /**
   * Consent status of every CONFIGURED purpose.
   *
   * Note this reports configuration, not whether the visitor has answered: on
   * a fresh session with one purpose it returns `{ <purposeId>: false }`. See
   * `hasZarazConsentRecord` in src/helper/consent.ts for why that matters.
   */
  getAll?: () => Record<string, boolean>;
  /** Delivers events Zaraz withheld while consent was unanswered. */
  sendQueuedEvents?: () => void;
}

interface Zaraz {
  /** Sends a custom event to every tool with a matching trigger. */
  track: (eventName: string, properties?: ZarazEventProperties) => void;
  /** Fires Zaraz's internal SPA pageview event using the current title + URL. */
  spaPageview: () => void;
  /** Sets a variable available to triggers and actions. */
  set: (
    key: string,
    value: unknown,
    options?: { scope?: 'page' | 'session' | 'persist' },
  ) => void;
  /** Present only when Consent Management is enabled on the zone. */
  consent?: ZarazConsent;
}

interface Window {
  zaraz?: Zaraz;
}
