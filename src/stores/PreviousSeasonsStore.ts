/**
 * Previous Seasons Store
 * MobX store for managing historical season data from the Sleeper API
 */

import { makeAutoObservable, runInAction, computed } from 'mobx';
import type {
  Roster,
  User,
  Transaction,
  Draft,
  DraftPick,
} from '../types/sleeper';
import {
  fetchLeague,
  fetchRosters,
  fetchUsers,
  fetchTransactions,
  fetchDrafts,
  fetchDraftPicks,
} from '../services/sleeperApi';
import { DEFAULT_LEAGUE_ID } from '../constants';

const REGULAR_SEASON_WEEKS = 18;

/**
 * League statuses for which the current season has results worth counting
 * in all-time aggregations. Pre-draft and drafting leagues are excluded so
 * empty 0-0 rows don't appear before the season starts.
 */
const ACTIVE_SEASON_STATUSES = new Set([
  'in_season',
  'post_season',
  'complete',
]);

export interface SeasonInfo {
  year: string;
  leagueId: string;
}

export interface AllSeasonEntry {
  leagueId: string;
  year: string;
  rosters: Roster[];
  users: User[];
}

export interface SeasonData {
  rosters: Roster[];
  users: User[];
  trades: Transaction[];
  draft: Draft | null;
  draftPicks: DraftPick[];
}

/**
 * MobX store for managing previous season data.
 *
 * @remarks
 * This store handles building the historical season chain by traversing
 * `previous_league_id` links, and fetching rosters, users, trades, and
 * draft picks for any selected past season.
 *
 * @example
 * ```typescript
 * const store = new PreviousSeasonsStore();
 * await store.buildSeasonChain();
 * store.setSelectedLeagueId(store.seasons[0].leagueId);
 * await store.loadSeasonData();
 * ```
 */
export class PreviousSeasonsStore {
  seasons: SeasonInfo[] = [];
  /**
   * The current season, set only once it has results (in season or later).
   * Kept separate from `seasons` so the Previous Seasons picker is unaffected.
   */
  currentSeason: SeasonInfo | null = null;
  selectedLeagueId: string = '';
  seasonData: SeasonData | null = null;
  allSeasonsData: AllSeasonEntry[] = [];
  isLoadingSeasons = false;
  isLoadingAllSeasons = false;
  isLoadingData = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      selectedYear: computed,
      allTimeSeasons: computed,
    });
  }

  /**
   * Build the chain of previous seasons by traversing `previous_league_id`.
   * Automatically selects the most recent previous season. Also records the
   * current season (when it has started) for all-time aggregations.
   */
  async buildSeasonChain(): Promise<void> {
    this.isLoadingSeasons = true;
    this.error = null;

    try {
      const currentLeague = await fetchLeague(DEFAULT_LEAGUE_ID);
      const chain: SeasonInfo[] = [];
      let prevId = currentLeague.previous_league_id;

      while (prevId) {
        const league = await fetchLeague(prevId);
        chain.push({ year: league.season, leagueId: prevId });
        prevId = league.previous_league_id;
      }

      const currentSeason: SeasonInfo | null = ACTIVE_SEASON_STATUSES.has(
        currentLeague.status,
      )
        ? { year: currentLeague.season, leagueId: DEFAULT_LEAGUE_ID }
        : null;

      runInAction(() => {
        this.seasons = chain;
        this.currentSeason = currentSeason;
        if (chain.length > 0) this.selectedLeagueId = chain[0].leagueId;
        this.isLoadingSeasons = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.isLoadingSeasons = false;
      });
    }
  }

  /**
   * Change the selected season and clear any previously loaded season data.
   * @param leagueId - The league ID for the season to select
   */
  setSelectedLeagueId(leagueId: string): void {
    this.selectedLeagueId = leagueId;
    this.seasonData = null;
    this.error = null;
  }

  /**
   * Load all data (rosters, users, trades, draft picks) for the currently
   * selected season.
   */
  async loadSeasonData(): Promise<void> {
    if (!this.selectedLeagueId) return;

    this.isLoadingData = true;
    this.seasonData = null;
    this.error = null;

    try {
      const leagueId = this.selectedLeagueId;
      const weekPromises = Array.from(
        { length: REGULAR_SEASON_WEEKS },
        (_, i) =>
          fetchTransactions(leagueId, i + 1).catch(() => [] as Transaction[]),
      );

      const [rosters, users, drafts, ...weekResults] = await Promise.all([
        fetchRosters(leagueId),
        fetchUsers(leagueId),
        fetchDrafts(leagueId),
        ...weekPromises,
      ]);

      const trades = (weekResults as Transaction[][])
        .flat()
        .filter((tx) => tx.type === 'trade')
        .sort((a, b) => b.created - a.created);

      const completedDraft =
        (drafts as Draft[])
          .filter((d) => d.status === 'complete')
          .sort((a, b) => b.start_time - a.start_time)[0] ?? null;

      let draftPicks: DraftPick[] = [];
      if (completedDraft) {
        draftPicks = await fetchDraftPicks(completedDraft.draft_id);
      }

      runInAction(() => {
        this.seasonData = {
          rosters: rosters as Roster[],
          users: users as User[],
          trades,
          draft: completedDraft,
          draftPicks,
        };
        this.isLoadingData = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.isLoadingData = false;
      });
    }
  }

  /**
   * The year string for the currently selected season.
   */
  get selectedYear(): string {
    return (
      this.seasons.find((s) => s.leagueId === this.selectedLeagueId)?.year ?? ''
    );
  }

  /**
   * Every season that counts toward all-time aggregations: the current
   * season (once it has started) followed by all previous seasons.
   */
  get allTimeSeasons(): SeasonInfo[] {
    return this.currentSeason
      ? [this.currentSeason, ...this.seasons]
      : this.seasons;
  }

  /**
   * Load rosters and users for every season in `allTimeSeasons` and store
   * them for all-time aggregations (e.g. all-time standings on the Hall of
   * Records). Includes the in-progress season, so totals update weekly.
   * Uses per-season error handling so one failed season doesn't block the rest.
   */
  async loadAllSeasonsData(): Promise<void> {
    const seasonsToLoad = this.allTimeSeasons;
    if (seasonsToLoad.length === 0) return;

    this.isLoadingAllSeasons = true;
    this.error = null;

    try {
      const settled = await Promise.allSettled(
        seasonsToLoad.map(async ({ leagueId, year }) => {
          const [rosters, users] = await Promise.all([
            fetchRosters(leagueId),
            fetchUsers(leagueId),
          ]);
          return {
            leagueId,
            year,
            rosters: rosters as Roster[],
            users: users as User[],
          };
        }),
      );

      const results: AllSeasonEntry[] = settled
        .filter(
          (r): r is PromiseFulfilledResult<AllSeasonEntry> =>
            r.status === 'fulfilled',
        )
        .map((r) => r.value);

      runInAction(() => {
        this.allSeasonsData = results;
        this.isLoadingAllSeasons = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.isLoadingAllSeasons = false;
      });
    }
  }

  reset(): void {
    this.seasons = [];
    this.currentSeason = null;
    this.selectedLeagueId = '';
    this.seasonData = null;
    this.allSeasonsData = [];
    this.isLoadingSeasons = false;
    this.isLoadingAllSeasons = false;
    this.isLoadingData = false;
    this.error = null;
  }
}
