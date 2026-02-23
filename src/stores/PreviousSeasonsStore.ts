/**
 * Previous Seasons Store
 * MobX store for managing historical season data from the Sleeper API
 */

import { makeAutoObservable, runInAction, computed } from "mobx";
import type { Roster, User, Transaction, Draft, DraftPick } from "../types/sleeper";
import {
  fetchLeague,
  fetchRosters,
  fetchUsers,
  fetchTransactions,
  fetchDrafts,
  fetchDraftPicks,
} from "../services/sleeperApi";
import { DEFAULT_LEAGUE_ID } from "../constants";

const REGULAR_SEASON_WEEKS = 18;

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
  selectedLeagueId: string = "";
  seasonData: SeasonData | null = null;
  allSeasonsData: AllSeasonEntry[] = [];
  isLoadingSeasons = false;
  isLoadingAllSeasons = false;
  isLoadingData = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      selectedYear: computed,
    });
  }

  /**
   * Build the chain of previous seasons by traversing `previous_league_id`.
   * Automatically selects the most recent previous season.
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

      runInAction(() => {
        this.seasons = chain;
        if (chain.length > 0) this.selectedLeagueId = chain[0].leagueId;
        this.isLoadingSeasons = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
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
      const weekPromises = Array.from({ length: REGULAR_SEASON_WEEKS }, (_, i) =>
        fetchTransactions(leagueId, i + 1).catch(() => [] as Transaction[])
      );

      const [rosters, users, drafts, ...weekResults] = await Promise.all([
        fetchRosters(leagueId),
        fetchUsers(leagueId),
        fetchDrafts(leagueId),
        ...weekPromises,
      ]);

      const trades = (weekResults as Transaction[][])
        .flat()
        .filter((tx) => tx.type === "trade")
        .sort((a, b) => b.created - a.created);

      const completedDraft =
        (drafts as Draft[])
          .filter((d) => d.status === "complete")
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
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoadingData = false;
      });
    }
  }

  /**
   * The year string for the currently selected season.
   */
  get selectedYear(): string {
    return (
      this.seasons.find((s) => s.leagueId === this.selectedLeagueId)?.year ?? ""
    );
  }

  /**
   * Load rosters and users for all seasons in the chain and store them for
   * all-time aggregations (e.g. all-time standings on the Hall of Records).
   */
  async loadAllSeasonsData(): Promise<void> {
    if (this.seasons.length === 0) return;

    this.isLoadingAllSeasons = true;

    try {
      const results = await Promise.all(
        this.seasons.map(async ({ leagueId, year }) => {
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
        })
      );

      runInAction(() => {
        this.allSeasonsData = results;
        this.isLoadingAllSeasons = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoadingAllSeasons = false;
      });
    }
  }

  reset(): void {
    this.seasons = [];
    this.selectedLeagueId = "";
    this.seasonData = null;
    this.allSeasonsData = [];
    this.isLoadingSeasons = false;
    this.isLoadingAllSeasons = false;
    this.isLoadingData = false;
    this.error = null;
  }
}
