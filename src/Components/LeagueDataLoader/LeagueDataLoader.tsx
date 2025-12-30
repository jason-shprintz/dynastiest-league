/**
 * League Data Loader Component
 * Demonstrates fetching and observing Sleeper API data using MobX stores
 */

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { DEFAULT_LEAGUE_ID } from "../../constants";

interface LeagueDataLoaderProps {
  leagueId?: string;
}

/**
 * Component that loads all league data on mount
 * This serves as a demonstration of the data fetching functionality
 */
export const LeagueDataLoader = observer(
  ({ leagueId = DEFAULT_LEAGUE_ID }: LeagueDataLoaderProps) => {
    const store = useStore();

    useEffect(() => {
      // Load all basic league data
      store.loadAllLeagueData(leagueId);

      // Load matchups for week 1 as an example
      store.loadMatchupsForWeek(leagueId, 1);

      // Load transactions for week 1 as an example
      store.loadTransactionsForWeek(leagueId, 1);
    }, [store, leagueId]);

    return (
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <h2>Sleeper League Data Status</h2>

        {/* League Info */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>League</h3>
          {store.leagueStore.isLoading && <p>Loading league data...</p>}
          {store.leagueStore.error && (
            <p style={{ color: "red" }}>Error: {store.leagueStore.error}</p>
          )}
          {store.leagueStore.league && (
            <div>
              <p>
                <strong>Name:</strong> {store.leagueStore.league.name}
              </p>
              <p>
                <strong>Season:</strong> {store.leagueStore.league.season}
              </p>
              <p>
                <strong>Total Rosters:</strong>{" "}
                {store.leagueStore.league.total_rosters}
              </p>
              <p>
                <strong>Status:</strong> {store.leagueStore.league.status}
              </p>
            </div>
          )}
        </div>

        {/* Rosters */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Rosters</h3>
          {store.rostersStore.isLoading && <p>Loading rosters...</p>}
          {store.rostersStore.error && (
            <p style={{ color: "red" }}>Error: {store.rostersStore.error}</p>
          )}
          {store.rostersStore.rosters.length > 0 && (
            <p>Loaded {store.rostersStore.rosters.length} rosters</p>
          )}
        </div>

        {/* Users */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Users</h3>
          {store.usersStore.isLoading && <p>Loading users...</p>}
          {store.usersStore.error && (
            <p style={{ color: "red" }}>Error: {store.usersStore.error}</p>
          )}
          {store.usersStore.users.length > 0 && (
            <p>Loaded {store.usersStore.users.length} users</p>
          )}
        </div>

        {/* Matchups */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Matchups (Week 1)</h3>
          {store.matchupsStore.isLoading && <p>Loading matchups...</p>}
          {store.matchupsStore.error && (
            <p style={{ color: "red" }}>Error: {store.matchupsStore.error}</p>
          )}
          {store.matchupsStore.getMatchupsForWeek(1).length > 0 && (
            <p>
              Loaded {store.matchupsStore.getMatchupsForWeek(1).length} matchups
            </p>
          )}
        </div>

        {/* Drafts */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Drafts</h3>
          {store.draftStore.isLoading && <p>Loading drafts...</p>}
          {store.draftStore.error && (
            <p style={{ color: "red" }}>Error: {store.draftStore.error}</p>
          )}
          {store.draftStore.drafts.length > 0 && (
            <div>
              <p>Loaded {store.draftStore.drafts.length} draft(s)</p>
              {store.draftStore.mostRecentDraft && (
                <p>
                  <strong>Most Recent Draft:</strong>{" "}
                  {store.draftStore.mostRecentDraft.draft_id}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Playoffs */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Playoff Bracket</h3>
          {store.playoffsStore.isLoading && <p>Loading playoff bracket...</p>}
          {store.playoffsStore.error && (
            <p style={{ color: "red" }}>Error: {store.playoffsStore.error}</p>
          )}
          {store.playoffsStore.bracket.length > 0 && (
            <p>
              Loaded {store.playoffsStore.bracket.length} playoff matchup(s)
            </p>
          )}
        </div>

        {/* Transactions */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Transactions (Week 1)</h3>
          {store.transactionsStore.isLoading && <p>Loading transactions...</p>}
          {store.transactionsStore.error && (
            <p style={{ color: "red" }}>
              Error: {store.transactionsStore.error}
            </p>
          )}
          {store.transactionsStore.getTransactionsForWeek(1).length > 0 && (
            <p>
              Loaded {store.transactionsStore.getTransactionsForWeek(1).length}{" "}
              transaction(s)
            </p>
          )}
        </div>

        {/* Traded Picks */}
        <div
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
          }}
        >
          <h3>Traded Picks</h3>
          {store.tradedPicksStore.isLoading && <p>Loading traded picks...</p>}
          {store.tradedPicksStore.error && (
            <p style={{ color: "red" }}>
              Error: {store.tradedPicksStore.error}
            </p>
          )}
          {store.tradedPicksStore.tradedPicks.length > 0 && (
            <p>
              Loaded {store.tradedPicksStore.tradedPicks.length} traded pick(s)
            </p>
          )}
        </div>
      </div>
    );
  }
);
