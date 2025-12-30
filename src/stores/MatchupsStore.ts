/**
 * Matchups Store
 * MobX store for managing matchup data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Matchup } from "../types/sleeper";
import { fetchMatchups } from "../services/sleeperApi";

/**
 * MobX store for managing NFL fantasy league matchups data.
 * 
 * This store handles fetching, caching, and accessing matchup data
 * organized by week from the Sleeper API.
 * 
 * @example
 * ```typescript
 * const matchupsStore = new MatchupsStore();
 * await matchupsStore.loadMatchups('league123', 1);
 * const weekOneMatchups = matchupsStore.getMatchupsForWeek(1);
 * ```
 * 
 * @remarks
 * The store uses MobX for reactive state management and caches
 * matchups by week number to avoid redundant API calls.
 */
export class MatchupsStore {
  matchupsByWeek: Map<number, Matchup[]> = new Map();
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadMatchups(leagueId: string, week: number): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchMatchups(leagueId, week);
      runInAction(() => {
        this.matchupsByWeek.set(week, data);
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  getMatchupsForWeek(week: number): Matchup[] {
    return this.matchupsByWeek.get(week) || [];
  }

  reset(): void {
    this.matchupsByWeek.clear();
    this.isLoading = false;
    this.error = null;
  }
}
