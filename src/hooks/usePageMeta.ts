import { useEffect, useRef } from 'react';
import { Section } from '../types';
import { trackPageview } from '../helper/analytics';

const sectionMeta: Record<Section, { title: string; description: string }> = {
  home: {
    title: 'The Dynastiest League | Dynasty Fantasy Football Since 2020',
    description:
      'A 10-team dynasty fantasy football league established in 2020 with a $1,000 annual prize pool.',
  },
  blog: {
    title: "Commissioner's Blog | The Dynastiest League",
    description:
      'Updates, news, and analysis from the Dynastiest League Commissioner.',
  },
  records: {
    title: 'Hall of Records | The Dynastiest League',
    description:
      'All-time stats, records, and historical data for the Dynastiest League.',
  },
  champion: {
    title: 'Current Champion | The Dynastiest League',
    description:
      '2025 Dynastiest League champion jeffgottfried. View season highlights and championship history.',
  },
  constitution: {
    title: 'League Constitution | The Dynastiest League',
    description:
      'Full rules, scoring settings, roster limits, draft procedures, and trade policies for the Dynastiest League.',
  },
  scouting: {
    title: 'Scouting | The Dynastiest League',
    description:
      'Player scouting reports and analysis for Dynastiest League managers.',
  },
  teams: {
    title: 'All Teams | The Dynastiest League',
    description:
      'View all 10 teams in the Dynastiest League dynasty fantasy football league.',
  },
  trades: {
    title: 'Trades | The Dynastiest League',
    description: 'Recent trade history and analysis for the Dynastiest League.',
  },
  draft: {
    title: 'Draft | The Dynastiest League',
    description:
      'Live rookie draft board with per-pick AI commentary and overall team grades from Mike & Jim.',
  },
  'previous-seasons': {
    title: 'Previous Seasons | The Dynastiest League',
    description:
      'Historical season results and champion history for the Dynastiest League since 2020.',
  },
  privacy: {
    title: 'Privacy | The Dynastiest League',
    description:
      'What dynastiestleague.com collects, who receives it, and how to avoid it.',
  },
};

/**
 * Custom hook that updates the document title and meta tags whenever the active
 * section changes, improving SEO and AI engine visibility for the SPA, and
 * reports the change to analytics as a pageview.
 *
 * Meta updates and pageview reporting live together deliberately. Zaraz reads
 * `document.title` and the URL off the document at the moment it is called, so
 * the pageview has to fire after the title above has been applied — keeping
 * both in one effect makes that ordering impossible to break by accident.
 *
 * @param activeSection - The currently active navigation section
 */
const usePageMeta = (activeSection: Section): void => {
  /**
   * Zaraz fires its own Pageview for the initial document load, and does so
   * even with "Single Page Application support" disabled in Zaraz Settings.
   * Reporting again on mount would double-count the first section of every
   * session, so the first run of this effect only updates the meta tags.
   *
   * In development React StrictMode double-invokes effects, which flips this
   * guard early and reports a spurious view. That is harmless: Zaraz is not
   * present outside the production zone, so `trackPageview` is a no-op there.
   */
  const hasSeenInitialRender = useRef(false);

  useEffect(() => {
    const meta = sectionMeta[activeSection];

    document.title = meta.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', meta.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute('content', meta.title);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute('content', meta.description);

    // App.tsx declares its history.pushState effect before calling this hook,
    // so effect ordering guarantees the hash is already current here.
    if (hasSeenInitialRender.current) {
      trackPageview();
      return;
    }

    hasSeenInitialRender.current = true;
  }, [activeSection]);
};

export default usePageMeta;
