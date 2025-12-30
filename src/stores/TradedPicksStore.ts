/**
 * Traded Picks Store
 * MobX store for managing traded pick data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { TradedPick } from "../types/sleeper";
import { fetchTradedPicks } from "../services/sleeperApi";

/**
 * MobX store for managing traded draft picks data from the Sleeper API.
 *
 * This store handles fetching, storing, and resetting traded picks information
 * for a fantasy football league. It tracks loading state and any errors that
 * occur during data fetching.
 *
 * @example
 * ```typescript
 * const tradedPicksStore = new TradedPicksStore();
 * await tradedPicksStore.loadTradedPicks('123456789');
 * console.log(tradedPicksStore.tradedPicks);
 * ```
 */
export class TradedPicksStore {
  tradedPicks: TradedPick[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadTradedPicks(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchTradedPicks(leagueId);
      runInAction(() => {
        this.tradedPicks = data;
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
    this.tradedPicks = [];
    this.isLoading = false;
    this.error = null;
  }
}
