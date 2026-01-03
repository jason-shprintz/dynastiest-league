/**
 * Breaking News Component
 * Displays all trades in the league with pagination/lazy loading
 */

import { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { DEFAULT_LEAGUE_ID } from "../../constants";
import { TradeCard } from "./TradeCard";
import {
  TradesSection,
  SectionDescription,
  TradesContainer,
  LoadingMessage,
  EmptyState,
  LoadMoreButton,
} from "./Trades.styles";

interface TradesProps {
  leagueId?: string;
}

const ITEMS_PER_PAGE = 10;

/**
 * Trades component that displays all trades with lazy loading
 */
const Trades = observer(({ leagueId = DEFAULT_LEAGUE_ID }: TradesProps) => {
  const {
    transactionsStore,
    usersStore,
    rostersStore,
    playersStore,
    leagueStore,
  } = useStore();
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const leagueYear: string =
    leagueStore.league?.season || new Date().getFullYear().toString();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        transactionsStore.loadAllTrades(leagueId),
        usersStore.loadUsers(leagueId),
        rostersStore.loadRosters(leagueId),
        playersStore.loadPlayers(),
        leagueStore.loadLeague(leagueId),
      ]);
    };

    loadData();
  }, [
    leagueId,
    transactionsStore,
    usersStore,
    rostersStore,
    playersStore,
    leagueStore,
  ]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  // Get all trades sorted by date (most recent first)
  const allTrades = transactionsStore.allTradesSorted;

  const visibleTrades = allTrades.slice(0, visibleCount);
  const hasMore = visibleCount < allTrades.length;

  /**
   * Get roster name from roster ID
   */
  const getRosterName = useCallback(
    (rosterId: number): string => {
      const roster = rostersStore.rosters.find((r) => r.roster_id === rosterId);
      if (!roster) return `Team ${rosterId}`;

      const user = usersStore.users.find((u) => u.user_id === roster.owner_id);
      if (!user) return `Team ${rosterId}`;

      return user.metadata?.team_name || user.display_name || user.username;
    },
    [rostersStore.rosters, usersStore.users]
  );

  if (
    transactionsStore.isLoading ||
    usersStore.isLoading ||
    rostersStore.isLoading ||
    playersStore.isLoading
  ) {
    return (
      <TradesSection>
        <h2>Trades</h2>
        <LoadingMessage>Loading trades...</LoadingMessage>
      </TradesSection>
    );
  }

  if (transactionsStore.error) {
    return (
      <TradesSection>
        <h2>Trades</h2>
        <EmptyState>Error loading trades: {transactionsStore.error}</EmptyState>
      </TradesSection>
    );
  }

  if (allTrades.length === 0) {
    return (
      <TradesSection>
        <h2>Trades</h2>
        <SectionDescription>
          All league trades in {leagueYear}
        </SectionDescription>
        <EmptyState>No trades have been made in this league yet.</EmptyState>
      </TradesSection>
    );
  }

  return (
    <TradesSection>
      <h2>Trades</h2>
      <SectionDescription>
        {allTrades.length} {allTrades.length === 1 ? "trade" : "trades"}
        &nbsp;in&nbsp;
        {leagueYear}
      </SectionDescription>
      <TradesContainer>
        {visibleTrades.map((trade) => (
          <TradeCard
            key={trade.transaction_id}
            trade={trade}
            players={playersStore.players}
            getRosterName={getRosterName}
          />
        ))}
      </TradesContainer>
      {hasMore && (
        <LoadMoreButton onClick={handleLoadMore}>
          Load More ({allTrades.length - visibleCount} remaining)
        </LoadMoreButton>
      )}
    </TradesSection>
  );
});

export default Trades;
