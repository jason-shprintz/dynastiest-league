/**
 * League Store
 * MobX store for managing league data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { League } from "../types/sleeper";
import { fetchLeague } from "../services/sleeperApi";

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
