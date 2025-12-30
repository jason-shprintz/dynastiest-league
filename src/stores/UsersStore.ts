/**
 * Users Store
 * MobX store for managing user data from Sleeper API
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { User } from "../types/sleeper";
import { fetchUsers } from "../services/sleeperApi";

export class UsersStore {
  users: User[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async loadUsers(leagueId: string): Promise<void> {
    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchUsers(leagueId);
      runInAction(() => {
        this.users = data;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  getUserById(userId: string): User | undefined {
    return this.users.find((user) => user.user_id === userId);
  }

  reset(): void {
    this.users = [];
    this.isLoading = false;
    this.error = null;
  }
}
