/**
 * Draft Store
 * MobX store for managing draft data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Draft } from "../types/sleeper";
import { fetchDrafts } from "../services/sleeperApi";

/**
 * MobX store for managing NFL fantasy draft data from the Sleeper API.
 *
 * @remarks
 * This store handles fetching, storing, and accessing draft information
 * for a fantasy football league. It uses MobX for reactive state management.
 *
 * @example
 * ```typescript
 * const draftStore = new DraftStore();
 * await draftStore.loadDrafts('123456789');
 * console.log(draftStore.mostRecentDraft);
 * ```
 */
export class DraftStore {
  drafts: Draft[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadDrafts(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchDrafts(leagueId);
      runInAction(() => {
        this.drafts = data;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  get mostRecentDraft(): Draft | null {
    if (this.drafts.length === 0) return null;
    if (this.drafts.length === 1) return this.drafts[0];
    return this.drafts.reduce((latest, current) => {
      return current.created > latest.created ? current : latest;
    });
  }

  reset(): void {
    this.drafts = [];
    this.isLoading = false;
    this.error = null;
  }
}
