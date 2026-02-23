type Section =
  | 'home'
  | 'records'
  | 'champion'
  | 'constitution'
  | 'scouting'
  | 'blog'
  | 'teams'
  | 'trades'
  | 'previous-seasons';

// Navigation target that can include an optional subsection for deep linking
interface NavigationTarget {
  section: Section;
  subsection?: string;
}

interface ConstitutionSection {
  id: string;
  title: string;
  content: string;
}

interface CurrentChampion {
  team: string;
  owner: string;
  year: string;
  record: string;
  points: number;
  playoffRun: string;
}

interface ChampionRecord {
  year: string;
  champion: string;
  second: string;
  third: string;
}

interface BlogPost {
  id: string;
  title: string;
  date: string;
  content: string;
}

export type {
  Section,
  NavigationTarget,
  ConstitutionSection,
  CurrentChampion,
  ChampionRecord,
  BlogPost,
};
