/**
 * Rosters Store
 * MobX store for managing roster data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Roster } from "../types/sleeper";
import { fetchRosters } from "../services/sleeperApi";

/**
 * MobX store for managing NFL fantasy league roster data.
 * 
 * This store handles fetching, storing, and managing roster information
 * from the Sleeper API. It provides observable state for rosters,
 * loading status, and error handling.
 * 
 * @example
 * ```typescript
 * const rostersStore = new RostersStore();
 * await rostersStore.loadRosters('123456789');
 * console.log(rostersStore.rosters);
 * ```
 * 
 * @remarks
 * This store uses MobX for state management with `makeAutoObservable`
 * for automatic observable property detection. All async state updates
 * are wrapped in `runInAction` to ensure proper MobX action boundaries.
 */
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
