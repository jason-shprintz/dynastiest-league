/**
 * Traded Picks Store
 * MobX store for managing traded pick data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { TradedPick } from "../types/sleeper";
import { fetchTradedPicks } from "../services/sleeperApi";

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
