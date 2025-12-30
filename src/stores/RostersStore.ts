/**
 * Rosters Store
 * MobX store for managing roster data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Roster } from "../types/sleeper";
import { fetchRosters } from "../services/sleeperApi";

export class RostersStore {
  rosters: Roster[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadRosters(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchRosters(leagueId);
      runInAction(() => {
        this.rosters = data;
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
    this.rosters = [];
    this.isLoading = false;
    this.error = null;
  }
}
