/**
 * Shared consent vocabulary.
 *
 * Kept separate from analytics.ts so the type-level answer to "has this
 * visitor agreed?" has no dependency on the Zaraz wrapper that consumes it.
 * Mirrors src/lib/analytics-consent.ts in the portfolio and alley-admin,
 * minus the server-side notes - there is no server here.
 */

export const ANALYTICS_CONSENT_COOKIE = 'analytics-consent';

/** One year, the usual ceiling for a consent record before re-prompting. */
export const ANALYTICS_CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export type ConsentValue = 'granted' | 'denied';

/**
 * `null` means the visitor has not chosen yet, which is distinct from
 * 'denied'. The banner opens on `null` only - a recorded refusal is an answer
 * and must not be re-asked on every visit.
 */
export type ConsentState = ConsentValue | 'not-required' | null;

/**
 * Vite inlines `import.meta.env.*` at BUILD time, so this is fixed when the
 * bundle is produced, not read at runtime. Changing the variable requires a
 * redeploy, and it must be set wherever the build actually runs.
 */
export const isAnalyticsConsentRequired = (): boolean =>
  import.meta.env.VITE_ANALYTICS_REQUIRE_CONSENT === '1';

export const parseConsentValue = (
  raw: string | null | undefined,
): ConsentValue | null => (raw === 'granted' || raw === 'denied' ? raw : null);
