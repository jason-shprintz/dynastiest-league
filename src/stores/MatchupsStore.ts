/**
 * Matchups Store
 * MobX store for managing matchup data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Matchup } from "../types/sleeper";
import { fetchMatchups } from "../services/sleeperApi";

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
