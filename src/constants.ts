import { Section } from './types';

export const DEFAULT_LEAGUE_ID = '1326434695138787328';

/**
 * All valid section identifiers for the app, used for hash-based routing and
 * NavLink validation. This is the single source of truth — both App.tsx and
 * renderContentWithLinks reuse this constant to avoid drift.
 *
 * `privacy` is routable and deep-linkable via `#privacy`, but is deliberately
 * absent from the header navigation — it is reached from the footer.
 *
 * `not-found` is deliberately NOT listed. This array answers "is this hash
 * something a visitor can legitimately ask for?", and the not-found section is
 * a destination the app chooses, never one a URL or a NavLink can request.
 * Including it would make `#not-found` resolve as a valid route, which is
 * circular, and would let blog content link straight to the error page.
 */
export const VALID_SECTIONS: readonly Section[] = [
  'home',
  'blog',
  'teams',
  'trades',
  'draft',
  'scouting',
  'records',
  'champion',
  'previous-seasons',
  'constitution',
  'privacy',
] as const;

/** Returns true if `value` is a recognised Section identifier. */
export const isValidSection = (value: string): value is Section => {
  return (VALID_SECTIONS as readonly string[]).includes(value);
};
