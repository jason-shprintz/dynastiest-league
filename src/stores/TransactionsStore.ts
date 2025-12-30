/**
 * Transactions Store
 * MobX store for managing transaction data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Transaction } from "../types/sleeper";
import { fetchTransactions } from "../services/sleeperApi";

export class TransactionsStore {
  transactionsByWeek: Map<number, Transaction[]> = new Map();
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
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

  reset(): void {
    this.transactionsByWeek.clear();
    this.isLoading = false;
    this.error = null;
  }
}
