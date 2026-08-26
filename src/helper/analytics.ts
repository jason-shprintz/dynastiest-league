/**
 * Thin wrapper over the Cloudflare Zaraz Web API.
 *
 * Zaraz is only present on the production zone (dynastiestleague.com), where it
 * is injected into the response at Cloudflare's edge. Locally, on *.pages.dev
 * previews, and for any visitor running a content blocker, `window.zaraz` is
 * undefined — so every call here degrades to a no-op rather than throwing. In
 * dev the no-op logs instead, which makes it possible to verify that call sites
 * fire at the right moment without a live tag.
 */

const isDev = import.meta.env.DEV;

const getZaraz = (): Zaraz | undefined =>
  typeof window === 'undefined' ? undefined : window.zaraz;

/**
 * Reports a client-side navigation as a GA4 pageview.
 *
 * Call this only *after* `document.title` has been updated, since Zaraz reads
 * the title and URL off the document at call time.
 */
export const trackPageview = (): void => {
  const zaraz = getZaraz();

  // Checks the method rather than the object: Zaraz's early inline stub
  // defines `zaraz` with a queued `track` before the main script loads, but
  // `spaPageview` is not part of that stub, so a plain `if (window.zaraz)`
  // check can pass while the call still fails.
  if (typeof zaraz?.spaPageview !== 'function') {
    if (isDev) {
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
  const zaraz = getZaraz();

  if (typeof zaraz?.track !== 'function') {
    if (isDev) {
      console.debug('[analytics] event (no-op):', eventName, properties);
    }
    return;
  }

  zaraz.track(eventName, properties);
};
