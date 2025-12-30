/**
 * Players Store
 * MobX store for managing player data from Sleeper API
 * Implements caching strategy using IndexedDB to minimize API calls (once per week)
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Player } from "../types/sleeper";
import { fetchAllPlayers } from "../services/sleeperApi";
import {
  getCachedData,
  setCachedData,
  deleteCachedData,
} from "../utils/indexedDBCache";

const PLAYERS_CACHE_KEY = "sleeper_players";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * MobX store for managing Sleeper player data.
 *
 * @remarks
 * This store handles fetching, caching, and querying player data from the Sleeper API.
 * It implements a caching strategy that stores player data in an IndexedDB-backed cache
 * (via the `indexedDBCache` utilities) and only fetches new data if the cache is older
 * than 7 days.
 *
 * According to Sleeper API documentation, the players endpoint should be called
 * sparingly (at most once per day). This implementation uses a weekly refresh cycle.
 *
 * @example
 * ```typescript
 * const playersStore = new PlayersStore();
 * await playersStore.loadPlayers();
 * const player = playersStore.getPlayerById('4046');
 * const playerName = playersStore.getPlayerName('4046');
 * ```
 */
export class PlayersStore {
  players: Record<string, Player> = {};
  isLoading = false;
  error: string | null = null;
  lastFetchTimestamp: number | null = null;
  private hasPlayers = false;
  private cacheLoaded = false;

  constructor() {
    makeAutoObservable(this);
    // Clean up old localStorage cache (migrating to IndexedDB)
    this.cleanupOldCache();
  }

  /**
   * Remove old localStorage cache entries (migration cleanup)
   */
  private cleanupOldCache(): void {
    try {
      localStorage.removeItem("sleeper_players_cache");
      localStorage.removeItem("sleeper_players_cache_timestamp");
    } catch {
      // Ignore errors during cleanup
    }
  }

  /**
   * Load player data from IndexedDB cache if available
   */
  private async loadFromCache(): Promise<void> {
    if (this.cacheLoaded) return;

    try {
      const cached = await getCachedData<Record<string, Player>>(
        PLAYERS_CACHE_KEY
      );

      if (cached) {
        runInAction(() => {
          this.players = cached.data;
          this.lastFetchTimestamp = cached.timestamp;
          this.hasPlayers = true;
          this.cacheLoaded = true;
        });
      }
    } catch (err) {
      console.error("Failed to load players from cache:", err);
      // Try to clear invalid cache
      await deleteCachedData(PLAYERS_CACHE_KEY);
    }
  }

  /**
   * Save player data to IndexedDB cache
   */
  private async saveToCache(): Promise<void> {
    try {
      await setCachedData(
        PLAYERS_CACHE_KEY,
        this.players,
        this.lastFetchTimestamp || Date.now()
      );
    } catch (err) {
      console.error("Failed to save players to cache:", err);
    }
  }

  /**
   * Check if the cache is still valid (less than 7 days old)
   */
  private isCacheValid(): boolean {
    if (!this.lastFetchTimestamp) return false;
    const now = Date.now();
    return now - this.lastFetchTimestamp < CACHE_DURATION_MS;
  }

  /**
   * Load players from API or cache
   * Only fetches from API if cache is invalid or force refresh is requested
   * @param forceRefresh - If true, bypass cache and fetch fresh data from API
   */
  async loadPlayers(forceRefresh = false): Promise<void> {
    // First, try to load from cache if not already loaded
    if (!this.cacheLoaded) {
      await this.loadFromCache();
    }

    // If cache is valid and not forcing refresh, use cached data
    if (!forceRefresh && this.isCacheValid() && this.hasPlayers) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchAllPlayers();
      runInAction(() => {
        this.players = data;
        this.lastFetchTimestamp = Date.now();
        this.hasPlayers = true;
        this.isLoading = false;
      });
      // Save to cache asynchronously (don't block)
      this.saveToCache();
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : "Unknown error";
        this.isLoading = false;
      });
    }
  }

  /**
   * Get a player by their ID
   * @param playerId - The player's unique identifier
   * @returns Player object or undefined if not found
   */
  getPlayerById = (playerId: string): Player | undefined => {
    return this.players[playerId];
  };

  /**
   * Get a player's full name by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's full name or the player ID if not found
   */
  getPlayerName = (playerId: string): string => {
    const player = this.players[playerId];
    return player?.full_name || playerId;
  };

  /**
   * Get a player's position by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's position or empty string if not found
   */
  getPlayerPosition = (playerId: string): string => {
    const player = this.players[playerId];
    return player?.position || "";
  };

  /**
   * Get a player's team by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's team abbreviation or 'FA' if free agent/not found
   */
  getPlayerTeam = (playerId: string): string => {
    const player = this.players[playerId];
    return player?.team || "FA";
  };

  /**
   * Reset the store to its initial state
   */
  reset(): void {
    this.players = {};
    this.isLoading = false;
    this.error = null;
    this.lastFetchTimestamp = null;
    this.hasPlayers = false;
    this.cacheLoaded = false;
    // Note: We don't clear IndexedDB on reset to preserve cache
  }
}
