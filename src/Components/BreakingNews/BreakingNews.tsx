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
  BreakingNewsSection,
  SectionDescription,
  TradesContainer,
  LoadingMessage,
  EmptyState,
  LoadMoreButton,
} from "./BreakingNews.styles";

interface BreakingNewsProps {
  leagueId?: string;
}

const ITEMS_PER_PAGE = 10;

/**
 * BreakingNews component that displays all trades with lazy loading
 */
export const BreakingNews = observer(
  ({ leagueId = DEFAULT_LEAGUE_ID }: BreakingNewsProps) => {
    const { transactionsStore, usersStore, rostersStore, playersStore } =
      useStore();
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    useEffect(() => {
      const loadData = async () => {
        await Promise.all([
          transactionsStore.loadAllTrades(leagueId),
          usersStore.loadUsers(leagueId),
          rostersStore.loadRosters(leagueId),
          playersStore.loadPlayers(),
        ]);
      };

      loadData();
    }, [leagueId, transactionsStore, usersStore, rostersStore, playersStore]);

    const handleLoadMore = useCallback(() => {
      setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
    }, []);

    // Get all trades sorted by date (most recent first)
    const allTrades = transactionsStore.allTrades.sort(
      (a, b) => b.created - a.created
    );

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

    if (transactionsStore.isLoading || usersStore.isLoading || rostersStore.isLoading) {
      return (
        <BreakingNewsSection>
          <h2>Breaking News</h2>
          <SectionDescription>All league trades</SectionDescription>
          <LoadingMessage>Loading trades...</LoadingMessage>
        </BreakingNewsSection>
      );
    }

    if (transactionsStore.error) {
      return (
        <BreakingNewsSection>
          <h2>Breaking News</h2>
          <SectionDescription>All league trades</SectionDescription>
          <EmptyState>
            Error loading trades: {transactionsStore.error}
          </EmptyState>
        </BreakingNewsSection>
      );
    }

    if (allTrades.length === 0) {
      return (
        <BreakingNewsSection>
          <h2>Breaking News</h2>
          <SectionDescription>All league trades</SectionDescription>
          <EmptyState>No trades have been made in this league yet.</EmptyState>
        </BreakingNewsSection>
      );
    }

    return (
      <BreakingNewsSection>
        <h2>Breaking News</h2>
        <SectionDescription>
          {allTrades.length} {allTrades.length === 1 ? "trade" : "trades"} in
          league history
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
      </BreakingNewsSection>
    );
  }
);
