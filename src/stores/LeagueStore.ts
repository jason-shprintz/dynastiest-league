/**
 * League Store
 * MobX store for managing league data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { League } from "../types/sleeper";
import { fetchLeague } from "../services/sleeperApi";

/**
 * MobX store for managing Sleeper fantasy football league data.
 * 
 * @remarks
 * This store handles fetching, caching, and state management for league information
 * retrieved from the Sleeper API. It provides reactive state for loading status,
 * error handling, and the fetched league data.
 * 
 * @example
 * ```typescript
 * const leagueStore = new LeagueStore();
 * await leagueStore.loadLeague('123456789');
 * console.log(leagueStore.league?.name);
 * ```
 */
export class LeagueStore {
  league: League | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadLeague(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchLeague(leagueId);
      runInAction(() => {
        this.league = data;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  reset(): void {
    this.league = null;
    this.isLoading = false;
    this.error = null;
  }
}
