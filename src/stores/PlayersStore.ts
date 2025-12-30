/**
 * Players Store
 * MobX store for managing player data from Sleeper API
 * Implements caching strategy to minimize API calls (once per week)
 */

import { makeAutoObservable, runInAction } from "mobx";
import type { Player } from "../types/sleeper";
import { fetchAllPlayers } from "../services/sleeperApi";

const PLAYERS_CACHE_KEY = "sleeper_players_cache";
const CACHE_TIMESTAMP_KEY = "sleeper_players_cache_timestamp";
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * MobX store for managing Sleeper player data.
 *
 * @remarks
 * This store handles fetching, caching, and querying player data from the Sleeper API.
 * It implements a caching strategy that stores player data in localStorage and only
 * fetches new data if the cache is older than 7 days.
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

  constructor() {
    makeAutoObservable(this);
    this.loadFromCache();
  }

  /**
   * Load player data from localStorage cache if available
   */
  private loadFromCache(): void {
    try {
      const cachedData = localStorage.getItem(PLAYERS_CACHE_KEY);
      const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (cachedData && cacheTimestamp) {
        this.players = JSON.parse(cachedData);
        this.lastFetchTimestamp = parseInt(cacheTimestamp, 10);
      }
    } catch (err) {
      console.error("Failed to load players from cache:", err);
      // Clear invalid cache
      localStorage.removeItem(PLAYERS_CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    }
  }

  /**
   * Save player data to localStorage cache
   */
  private saveToCache(): void {
    try {
      localStorage.setItem(PLAYERS_CACHE_KEY, JSON.stringify(this.players));
      localStorage.setItem(
        CACHE_TIMESTAMP_KEY,
        this.lastFetchTimestamp?.toString() || "",
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
    // If cache is valid and not forcing refresh, use cached data
    if (!forceRefresh && this.isCacheValid() && Object.keys(this.players).length > 0) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const data = await fetchAllPlayers();
      runInAction(() => {
        this.players = data;
        this.lastFetchTimestamp = Date.now();
        this.isLoading = false;
        this.saveToCache();
      });
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
  getPlayerById(playerId: string): Player | undefined {
    return this.players[playerId];
  }

  /**
   * Get a player's full name by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's full name or the player ID if not found
   */
  getPlayerName(playerId: string): string {
    const player = this.players[playerId];
    return player?.full_name || playerId;
  }

  /**
   * Get a player's position by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's position or empty string if not found
   */
  getPlayerPosition(playerId: string): string {
    const player = this.players[playerId];
    return player?.position || "";
  }

  /**
   * Get a player's team by their ID
   * @param playerId - The player's unique identifier
   * @returns Player's team abbreviation or empty string if not found
   */
  getPlayerTeam(playerId: string): string {
    const player = this.players[playerId];
    return player?.team || "";
  }

  /**
   * Reset the store to its initial state
   */
  reset(): void {
    this.players = {};
    this.isLoading = false;
    this.error = null;
    this.lastFetchTimestamp = null;
    // Note: We don't clear localStorage on reset to preserve cache
  }
}
