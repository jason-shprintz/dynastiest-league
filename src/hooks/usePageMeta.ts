import { useEffect } from 'react';
import { Section } from '../types';

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
};

/**
 * Custom hook that updates the document title and meta tags whenever the active
 * section changes, improving SEO and AI engine visibility for the SPA.
 *
 * @param activeSection - The currently active navigation section
 */
const usePageMeta = (activeSection: Section): void => {
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
  }, [activeSection]);
};

export default usePageMeta;
