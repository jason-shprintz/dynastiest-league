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
}

interface Window {
  zaraz?: Zaraz;
}
