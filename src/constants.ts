import { Section } from './types';

export const DEFAULT_LEAGUE_ID = '1326434695138787328';

/**
 * All valid section identifiers for the app, used for hash-based routing and
 * NavLink validation. This is the single source of truth — both App.tsx and
 * renderContentWithLinks reuse this constant to avoid drift.
 */
export const VALID_SECTIONS: readonly Section[] = [
  'home',
  'blog',
  'teams',
  'trades',
  'scouting',
  'records',
  'champion',
  'previous-seasons',
  'constitution',
] as const;

/** Returns true if `value` is a recognised Section identifier. */
export const isValidSection = (value: string): value is Section => {
  return (VALID_SECTIONS as readonly string[]).includes(value);
};
