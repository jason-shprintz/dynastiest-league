/**
 * Trade Analysis Store
 * MobX store for managing AI-generated trade analysis from Worker API
 */

import { makeAutoObservable, runInAction } from "mobx";

/**
 * Trade analysis structure from Worker API
 */
export interface TradeAnalysis {
  transaction_id: string;
  timestamp: number;
  teams: {
    [teamName: string]: {
      grade: string;
      received: {
        players: Array<{
          name: string;
          position: string;
          team: string | null;
        }>;
        picks: Array<{
          season: string;
          round: number;
        }>;
      };
      summary: string;
    };
  };
  conversation: Array<{
    speaker: "Mike" | "Jim";
    text: string;
  }>;
  overall_take: string;
}

/**
 * MobX store for managing trade analyses
 */
export class TradeAnalysisStore {
  analysisByTransactionId: Map<string, TradeAnalysis | null> = new Map();
  loadingTransactionIds: Set<string> = new Set();
  error: string | null = null;

  // Worker API endpoint - update with your actual worker URL
  private readonly workerUrl =
    import.meta.env.VITE_WORKER_URL ||
    "https://dynastiest-league-worker.your-subdomain.workers.dev";

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * Fetch analysis for a single transaction
   */
  async loadAnalysis(transactionId: string): Promise<void> {
    // Don't refetch if we already have it (even if null)
    if (this.analysisByTransactionId.has(transactionId)) {
      return;
    }

    // Don't fetch if already loading
    if (this.loadingTransactionIds.has(transactionId)) {
      return;
    }

    runInAction(() => {
      this.loadingTransactionIds.add(transactionId);
      this.error = null;
    });

    try {
      const response = await fetch(
        `${this.workerUrl}/api/trade-analysis?transaction_id=${encodeURIComponent(transactionId)}`
      );

      if (response.status === 404) {
        // Analysis doesn't exist yet
        runInAction(() => {
          this.analysisByTransactionId.set(transactionId, null);
          this.loadingTransactionIds.delete(transactionId);
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch analysis: ${response.statusText}`);
      }

      const analysis = (await response.json()) as TradeAnalysis;

      runInAction(() => {
        this.analysisByTransactionId.set(transactionId, analysis);
        this.loadingTransactionIds.delete(transactionId);
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.loadingTransactionIds.delete(transactionId);
      });
    }
  }

  /**
   * Fetch analyses for multiple transactions (batch)
   */
  async loadAnalysesBatch(transactionIds: string[]): Promise<void> {
    // Filter out IDs we already have
    const idsToFetch = transactionIds.filter(
      (id) => !this.analysisByTransactionId.has(id)
    );

    if (idsToFetch.length === 0) {
      return;
    }

    runInAction(() => {
      idsToFetch.forEach((id) => this.loadingTransactionIds.add(id));
      this.error = null;
    });

    try {
      const response = await fetch(
        `${this.workerUrl}/api/trade-analyses?ids=${idsToFetch.join(",")}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch analyses: ${response.statusText}`);
      }

      const analyses = (await response.json()) as Record<
        string,
        TradeAnalysis | null
      >;

      runInAction(() => {
        Object.entries(analyses).forEach(([transactionId, analysis]) => {
          this.analysisByTransactionId.set(transactionId, analysis);
        });
        idsToFetch.forEach((id) => this.loadingTransactionIds.delete(id));
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        idsToFetch.forEach((id) => this.loadingTransactionIds.delete(id));
      });
    }
  }

  /**
   * Get analysis for a transaction
   */
  getAnalysis(transactionId: string): TradeAnalysis | null | undefined {
    return this.analysisByTransactionId.get(transactionId);
  }

  /**
   * Check if analysis is loading
   */
  isLoadingAnalysis(transactionId: string): boolean {
    return this.loadingTransactionIds.has(transactionId);
  }

  /**
   * Reset store
   */
  reset(): void {
    this.analysisByTransactionId.clear();
    this.loadingTransactionIds.clear();
    this.error = null;
  }
}
