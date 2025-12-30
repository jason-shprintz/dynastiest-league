/**
 * Playoffs Store
 * MobX store for managing playoff bracket data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { PlayoffBracket } from "../types/sleeper";
import { fetchPlayoffBracket } from "../services/sleeperApi";

export class PlayoffsStore {
  bracket: PlayoffBracket[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadPlayoffBracket(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchPlayoffBracket(leagueId);
      runInAction(() => {
        this.bracket = data;
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
    this.bracket = [];
    this.isLoading = false;
    this.error = null;
  }
}
