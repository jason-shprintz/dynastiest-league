/**
 * Team Draft Grade Store
 * MobX store for managing AI-generated per-team overall draft grades from Worker API
 */

import { makeAutoObservable, runInAction } from 'mobx';

/**
 * Team draft grade structure from Worker API
 */
export interface TeamDraftGrade {
  draft_id: string;
  roster_id: number;
  overall_grade: string;
  best_pick: { pick_no: number; reason: string } | null;
  worst_pick: { pick_no: number; reason: string } | null;
  summary: string;
  conversation: Array<{
    speaker: 'Mike' | 'Jim';
    text: string;
  }>;
}

/**
 * MobX store for managing team draft grades, keyed by draft_id
 */
export class TeamDraftGradeStore {
  /** Map of draft_id → (roster_id → grade | null) */
  gradesByDraftId: Map<string, Map<number, TeamDraftGrade | null>> = new Map();
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
    if (!nextRetry) return true;
    return Date.now() >= nextRetry;
  }

  /**
   * Fetch all team grades for a draft
   */
  async loadGrades(draftId: string): Promise<void> {
    if (this.loadingDraftIds.has(draftId)) return;
    if (this.gradesByDraftId.has(draftId) && !this.shouldRetry(draftId)) return;

    runInAction(() => {
      this.loadingDraftIds.add(draftId);
      this.error = null;
    });

    try {
      const response = await fetch(
        `${this.workerUrl}/api/team-draft-grades?draft_id=${encodeURIComponent(draftId)}`,
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch team draft grades: ${response.statusText}`,
        );
      }

      const data = (await response.json()) as Record<
        string,
        TeamDraftGrade | null
      >;

      runInAction(() => {
        const map = new Map<number, TeamDraftGrade | null>();
        for (const [rosterIdStr, grade] of Object.entries(data)) {
          map.set(Number(rosterIdStr), grade);
        }
        this.gradesByDraftId.set(draftId, map);

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
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.loadingDraftIds.delete(draftId);
      });
    }
  }

  /**
   * Get grade for a specific team
   */
  getGrade(
    draftId: string,
    rosterId: number,
  ): TeamDraftGrade | null | undefined {
    return this.gradesByDraftId.get(draftId)?.get(rosterId);
  }

  /**
   * Get all grades for a draft as a map
   */
  getGradesForDraft(draftId: string): Map<number, TeamDraftGrade | null> {
    return this.gradesByDraftId.get(draftId) ?? new Map();
  }

  isLoading(draftId: string): boolean {
    return this.loadingDraftIds.has(draftId);
  }

  reset(): void {
    this.gradesByDraftId.clear();
    this.loadingDraftIds.clear();
    this.nextRetryAtByDraftId.clear();
    this.error = null;
  }
}
