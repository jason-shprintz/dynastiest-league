/**
 * Root Store
 * Combines all MobX stores for the Sleeper API data
 */

import { LeagueStore } from "./LeagueStore";
import { RostersStore } from "./RostersStore";
import { MatchupsStore } from "./MatchupsStore";
import { UsersStore } from "./UsersStore";
import { PlayoffsStore } from "./PlayoffsStore";
import { DraftStore } from "./DraftStore";
import { TransactionsStore } from "./TransactionsStore";
import { TradedPicksStore } from "./TradedPicksStore";
import { PlayersStore } from "./PlayersStore";
import { TradeAnalysisStore } from "./TradeAnalysisStore";

export class RootStore {
  leagueStore: LeagueStore;
  rostersStore: RostersStore;
  matchupsStore: MatchupsStore;
  usersStore: UsersStore;
  playoffsStore: PlayoffsStore;
  draftStore: DraftStore;
  transactionsStore: TransactionsStore;
  tradedPicksStore: TradedPicksStore;
  playersStore: PlayersStore;
  tradeAnalysisStore: TradeAnalysisStore;

  constructor() {
    this.leagueStore = new LeagueStore();
    this.rostersStore = new RostersStore();
    this.matchupsStore = new MatchupsStore();
    this.usersStore = new UsersStore();
    this.playoffsStore = new PlayoffsStore();
    this.draftStore = new DraftStore();
    this.transactionsStore = new TransactionsStore();
    this.tradedPicksStore = new TradedPicksStore();
    this.playersStore = new PlayersStore();
    this.tradeAnalysisStore = new TradeAnalysisStore();
  }

  /**
   * Load all league data for a given league ID
   * This fetches league info, rosters, users, drafts, playoff bracket, and traded picks
   * Uses Promise.allSettled to allow independent error handling for each store
   * @param leagueId - The ID of the league to load
   */
  async loadAllLeagueData(leagueId: string): Promise<void> {
    await Promise.allSettled([
      this.leagueStore.loadLeague(leagueId),
      this.rostersStore.loadRosters(leagueId),
      this.usersStore.loadUsers(leagueId),
      this.draftStore.loadDrafts(leagueId),
      this.playoffsStore.loadPlayoffBracket(leagueId),
      this.tradedPicksStore.loadTradedPicks(leagueId),
      this.playersStore.loadPlayers(), // Load players from cache or API
    ]);
  }

  /**
   * Load matchups for a specific week
   * @param leagueId - The ID of the league
   * @param week - The week number
   */
  async loadMatchupsForWeek(leagueId: string, week: number): Promise<void> {
    await this.matchupsStore.loadMatchups(leagueId, week);
  }

  /**
   * Load transactions for a specific week
   * @param leagueId - The ID of the league
   * @param week - The week number
   */
  async loadTransactionsForWeek(
    leagueId: string,
    week: number,
  ): Promise<void> {
    await this.transactionsStore.loadTransactions(leagueId, week);
  }

  /**
   * Reset all stores to their initial state
   */
  resetAll(): void {
    this.leagueStore.reset();
    this.rostersStore.reset();
    this.matchupsStore.reset();
    this.usersStore.reset();
    this.playoffsStore.reset();
    this.draftStore.reset();
    this.transactionsStore.reset();
    this.tradedPicksStore.reset();
    this.playersStore.reset();
    this.tradeAnalysisStore.reset();
  }
}
