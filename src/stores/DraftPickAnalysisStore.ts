/**
 * Draft Pick Analysis Store
 * MobX store for managing AI-generated draft pick analyses from Worker API
 */

import { makeAutoObservable, runInAction } from 'mobx';

/**
 * Draft pick analysis structure from Worker API
 */
export interface DraftPickAnalysis {
  pick_id: string;
  draft_id: string;
  pick_no: number;
  grade: string;
  value_vs_adp: string;
  conversation: Array<{
    speaker: 'Mike' | 'Jim';
    text: string;
  }>;
  hot_take: string;
}

/**
 * MobX store for managing draft pick analyses, keyed by draft_id
 */
export class DraftPickAnalysisStore {
  /** Map of draft_id → (pick_no → analysis | null) */
  analysesByDraftId: Map<string, Map<number, DraftPickAnalysis | null>> =
    new Map();
  loadingDraftIds: Set<string> = new Set();
  nextRetryAtByDraftId: Map<string, number> = new Map();
  error: string | null = null;

  // Worker API endpoint - must be set via environment variable
  private readonly workerUrl =
    import.meta.env.VITE_WORKER_URL ||
    (() => {
      throw new Error(
        'VITE_WORKER_URL environment variable is not set. Please configure it in .env.local',
      );
    })();

  // Retry configuration
  private readonly RETRY_DELAY_MS = 60000; // 1 minute

  constructor() {
    makeAutoObservable(this);
  }

  private shouldRetry(draftId: string): boolean {
    const nextRetry = this.nextRetryAtByDraftId.get(draftId);
    if (!nextRetry) return false;
    return Date.now() >= nextRetry;
  }

  /**
   * Fetch all pick analyses for a draft
   */
  async loadAnalyses(
    draftId: string,
    options?: { force?: boolean },
  ): Promise<boolean> {
    // Skip if already loading
    if (this.loadingDraftIds.has(draftId)) return false;

    // Check retry timer for drafts that returned empty
    if (
      !options?.force &&
      this.analysesByDraftId.has(draftId) &&
      !this.shouldRetry(draftId)
    ) {
      return false;
    }

    runInAction(() => {
      this.loadingDraftIds.add(draftId);
      this.error = null;
    });

    try {
      const response = await fetch(
        `${this.workerUrl}/api/draft-pick-analyses?draft_id=${encodeURIComponent(draftId)}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch draft pick analyses: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as Record<
        string,
        DraftPickAnalysis | null
      >;

      runInAction(() => {
        const map = new Map<number, DraftPickAnalysis | null>();
        for (const [pickNoStr, analysis] of Object.entries(data)) {
          map.set(Number(pickNoStr), analysis);
        }
        this.analysesByDraftId.set(draftId, map);

        // Schedule retry if no analyses exist yet (draft may not have started)
        if (map.size === 0) {
          this.nextRetryAtByDraftId.set(
            draftId,
            Date.now() + this.RETRY_DELAY_MS,
          );
        } else {
          this.nextRetryAtByDraftId.delete(draftId);
        }
        this.loadingDraftIds.delete(draftId);
      });
      return true;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.loadingDraftIds.delete(draftId);
      });
      return false;
    }
  }

  /**
   * Get analysis for a specific pick
   */
  getAnalysis(
    draftId: string,
    pickNo: number,
  ): DraftPickAnalysis | null | undefined {
    return this.analysesByDraftId.get(draftId)?.get(pickNo);
  }

  /**
   * Get all analyses for a draft as a map
   */
  getAnalysesForDraft(draftId: string): Map<number, DraftPickAnalysis | null> {
    return this.analysesByDraftId.get(draftId) ?? new Map();
  }

  isLoading(draftId: string): boolean {
    return this.loadingDraftIds.has(draftId);
  }

  reset(): void {
    this.analysesByDraftId.clear();
    this.loadingDraftIds.clear();
    this.nextRetryAtByDraftId.clear();
    this.error = null;
  }
}
