/**
 * Transactions Store
 * MobX store for managing transaction data from Sleeper API
 */

import { makeAutoObservable, runInAction, computed } from "mobx";
import type { Transaction } from "../types/sleeper";
import { fetchTransactions } from "../services/sleeperApi";

/**
 * MobX store for managing NFL fantasy league transactions.
 *
 * This store handles fetching, caching, and accessing transaction data
 * organized by week from the Sleeper API.
 *
 * @remarks
 * Transactions are stored in a Map keyed by week number, allowing efficient
 * retrieval of transactions for specific weeks while also supporting access
 * to all transactions across weeks.
 *
 * @example
 * ```typescript
 * const store = new TransactionsStore();
 *
 * // Load transactions for week 5
 * await store.loadTransactions('123456789', 5);
 *
 * // Get transactions for a specific week
 * const weekTransactions = store.getTransactionsForWeek(5);
 *
 * // Access all loaded transactions
 * const allTx = store.allTransactions;
 * ```
 */
export class TransactionsStore {
  transactionsByWeek: Map<number, Transaction[]> = new Map();
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this, {
      allTransactions: computed,
    });
  }

  async loadTransactions(leagueId: string, week: number): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchTransactions(leagueId, week);
      runInAction(() => {
        this.transactionsByWeek.set(week, data);
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  getTransactionsForWeek(week: number): Transaction[] {
    return this.transactionsByWeek.get(week) || [];
  }

  get allTransactions(): Transaction[] {
    return Array.from(this.transactionsByWeek.values()).flat();
  }

  get allTrades(): Transaction[] {
    return this.allTransactions.filter((tx) => tx.type === "trade");
  }

  async loadAllTrades(leagueId: string, totalWeeks = 18): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      // Load transactions for all weeks concurrently
      const promises = [];
      for (let week = 1; week <= totalWeeks; week++) {
        promises.push(fetchTransactions(leagueId, week));
      }

      const results = await Promise.allSettled(promises);

      runInAction(() => {
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            const week = index + 1;
            this.transactionsByWeek.set(week, result.value);
          }
        });
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
    this.transactionsByWeek.clear();
    this.isLoading = false;
    this.error = null;
  }
}
