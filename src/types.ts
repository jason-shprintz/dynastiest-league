type Section = "home" | "records" | "champion" | "constitution";

interface ConstitutionSection {
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

export type { Section, ConstitutionSection, CurrentChampion, ChampionRecord };
