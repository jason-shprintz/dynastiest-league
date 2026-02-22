import { useEffect, useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useStore, usePreviousSeasonsStore } from "../../stores";
import type { Roster, Player, DraftPick, Transaction } from "../../types/sleeper";
import { TradeCard } from "../Trades/TradeCard";
import {
  PageSection,
  SeasonSelectorRow,
  SeasonSelect,
  TabBar,
  TabButton,
  ContentArea,
  LoadingMessage,
  EmptyState,
  LoadMoreButton,
  StandingsWrapper,
  StandingsTable,
  TeamsGrid,
  TeamCard,
  TeamCardHeader,
  PlayerGroupLabel,
  PlayerRow,
  DraftTable,
} from "./PreviousSeasons.styles";

type Tab = "standings" | "teams" | "trades" | "draft";

const ITEMS_PER_PAGE = 10;

// --- Sub-view components ---

interface StandingsViewProps {
  rosters: Roster[];
  getTeamName: (roster: Roster) => string;
  getOwnerName: (roster: Roster) => string;
}

const StandingsView = ({
  rosters,
  getTeamName,
  getOwnerName,
}: StandingsViewProps) => {
  const sorted = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins)
      return b.settings.wins - a.settings.wins;
    return (
      b.settings.fpts +
      b.settings.fpts_decimal / 100 -
      (a.settings.fpts + a.settings.fpts_decimal / 100)
    );
  });

  return (
    <StandingsWrapper>
      <StandingsTable>
        <thead>
          <tr>
            <th className="rank">#</th>
            <th>Team</th>
            <th className="hide-mobile">Owner</th>
            <th className="numeric">W</th>
            <th className="numeric">L</th>
            <th className="numeric">PF</th>
            <th className="numeric">PA</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((roster, i) => {
            const pf = (
              roster.settings.fpts +
              roster.settings.fpts_decimal / 100
            ).toFixed(2);
            const pa = (
              roster.settings.fpts_against +
              roster.settings.fpts_against_decimal / 100
            ).toFixed(2);
            return (
              <tr key={roster.roster_id}>
                <td className="rank">{i + 1}</td>
                <td className="team">{getTeamName(roster)}</td>
                <td className="hide-mobile">{getOwnerName(roster)}</td>
                <td className="numeric">{roster.settings.wins}</td>
                <td className="numeric">{roster.settings.losses}</td>
                <td className="numeric">{pf}</td>
                <td className="numeric">{pa}</td>
              </tr>
            );
          })}
        </tbody>
      </StandingsTable>
    </StandingsWrapper>
  );
};

interface TeamsViewProps {
  rosters: Roster[];
  getTeamName: (roster: Roster) => string;
  getOwnerName: (roster: Roster) => string;
  players: Record<string, Player>;
}

const TeamsView = ({
  rosters,
  getTeamName,
  getOwnerName,
  players,
}: TeamsViewProps) => {
  const getPlayerLabel = (playerId: string) => {
    const p = players[playerId];
    if (!p) return playerId;
    return `${p.full_name || `${p.first_name} ${p.last_name}`}`;
  };

  const getPlayerPos = (playerId: string) => {
    return players[playerId]?.position ?? "—";
  };

  return (
    <TeamsGrid>
      {rosters.map((roster) => {
        const starterSet = new Set(roster.starters ?? []);
        const taxiSet = new Set(roster.taxi ?? []);
        const reserveSet = new Set(roster.reserve ?? []);
        const bench = (roster.players ?? []).filter(
          (id) => !starterSet.has(id) && !taxiSet.has(id) && !reserveSet.has(id)
        );
        const starters = roster.starters ?? [];

        return (
          <TeamCard key={roster.roster_id}>
            <TeamCardHeader>
              <div className="team-name">{getTeamName(roster)}</div>
              <div className="owner">{getOwnerName(roster)}</div>
            </TeamCardHeader>

            {starters.length > 0 && (
              <>
                <PlayerGroupLabel>Starters</PlayerGroupLabel>
                {starters.map((id) => (
                  <PlayerRow key={id}>
                    <span className="pos">{getPlayerPos(id)}</span>
                    <span>{getPlayerLabel(id)}</span>
                  </PlayerRow>
                ))}
              </>
            )}

            {bench.length > 0 && (
              <>
                <PlayerGroupLabel>Bench</PlayerGroupLabel>
                {bench.map((id) => (
                  <PlayerRow key={id}>
                    <span className="pos">{getPlayerPos(id)}</span>
                    <span>{getPlayerLabel(id)}</span>
                  </PlayerRow>
                ))}
              </>
            )}

            {(roster.taxi ?? []).length > 0 && (
              <>
                <PlayerGroupLabel>Taxi</PlayerGroupLabel>
                {(roster.taxi ?? []).map((id) => (
                  <PlayerRow key={id}>
                    <span className="pos">{getPlayerPos(id)}</span>
                    <span>{getPlayerLabel(id)}</span>
                  </PlayerRow>
                ))}
              </>
            )}

            {(roster.reserve ?? []).length > 0 && (
              <>
                <PlayerGroupLabel>IR</PlayerGroupLabel>
                {(roster.reserve ?? []).map((id) => (
                  <PlayerRow key={id}>
                    <span className="pos">{getPlayerPos(id)}</span>
                    <span>{getPlayerLabel(id)}</span>
                  </PlayerRow>
                ))}
              </>
            )}
          </TeamCard>
        );
      })}
    </TeamsGrid>
  );
};

interface TradesViewProps {
  trades: Transaction[];
  year: string;
  players: Record<string, Player>;
  getRosterName: (rosterId: number) => string;
  visibleCount: number;
  onLoadMore: () => void;
}

const TradesView = ({
  trades,
  year,
  players,
  getRosterName,
  visibleCount,
  onLoadMore,
}: TradesViewProps) => {
  if (trades.length === 0) {
    return (
      <EmptyState>No trades were made in the {year} season.</EmptyState>
    );
  }

  const visible = trades.slice(0, visibleCount);
  const hasMore = visibleCount < trades.length;

  return (
    <>
      {visible.map((trade) => (
        <TradeCard
          key={trade.transaction_id}
          trade={trade}
          players={players}
          getRosterName={getRosterName}
        />
      ))}
      {hasMore && (
        <LoadMoreButton onClick={onLoadMore}>
          Load More ({trades.length - visibleCount} remaining)
        </LoadMoreButton>
      )}
    </>
  );
};

interface DraftViewProps {
  picks: DraftPick[];
  year: string;
  getPickTeamName: (pick: DraftPick) => string;
}

const DraftView = ({ picks, year, getPickTeamName }: DraftViewProps) => {
  if (picks.length === 0) {
    return (
      <EmptyState>No draft data available for the {year} season.</EmptyState>
    );
  }

  const sorted = [...picks].sort((a, b) => a.pick_no - b.pick_no);

  return (
    <DraftTable>
      <thead>
        <tr>
          <th className="pick-no">Pick</th>
          <th>Rd</th>
          <th>Team</th>
          <th>Player</th>
          <th>Pos</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((pick) => {
          const firstName = pick.metadata?.first_name ?? "";
          const lastName = pick.metadata?.last_name ?? "";
          const playerName =
            firstName || lastName ? `${firstName} ${lastName}`.trim() : pick.player_id;
          const position = pick.metadata?.position ?? "—";

          return (
            <tr key={pick.pick_no}>
              <td className="pick-no">{pick.pick_no}</td>
              <td>{pick.round}</td>
              <td>{getPickTeamName(pick)}</td>
              <td className="player">{playerName}</td>
              <td className="pos">{position}</td>
            </tr>
          );
        })}
      </tbody>
    </DraftTable>
  );
};

// --- Main component ---

const PreviousSeasons = observer(() => {
  const { playersStore } = useStore();
  const previousSeasonsStore = usePreviousSeasonsStore();

  const [activeTab, setActiveTab] = useState<Tab>("standings");
  const [visibleTrades, setVisibleTrades] = useState(ITEMS_PER_PAGE);

  const { selectedLeagueId } = previousSeasonsStore;

  // Build season chain on mount
  useEffect(() => {
    if (previousSeasonsStore.seasons.length === 0 && !previousSeasonsStore.isLoadingSeasons) {
      previousSeasonsStore.buildSeasonChain();
    }
    playersStore.loadPlayers();
  }, [previousSeasonsStore, playersStore]);

  // Load season data whenever the selected league changes
  useEffect(() => {
    if (selectedLeagueId) {
      previousSeasonsStore.loadSeasonData();
      setVisibleTrades(ITEMS_PER_PAGE);
    }
  }, [previousSeasonsStore, selectedLeagueId]);

  const { seasonData, isLoadingSeasons, isLoadingData, seasons, selectedYear } =
    previousSeasonsStore;

  const getTeamName = useCallback(
    (roster: Roster): string => {
      const user = seasonData?.users.find((u) => u.user_id === roster.owner_id);
      if (!user) return `Team ${roster.roster_id}`;
      return user.metadata?.team_name || user.display_name || user.username;
    },
    [seasonData]
  );

  const getOwnerName = useCallback(
    (roster: Roster): string => {
      const user = seasonData?.users.find((u) => u.user_id === roster.owner_id);
      return user?.display_name || user?.username || "";
    },
    [seasonData]
  );

  const getRosterName = useCallback(
    (rosterId: number): string => {
      if (!seasonData) return `Team ${rosterId}`;
      const roster = seasonData.rosters.find((r) => r.roster_id === rosterId);
      if (!roster) return `Team ${rosterId}`;
      return getTeamName(roster);
    },
    [seasonData, getTeamName]
  );

  const getPickTeamName = useCallback(
    (pick: DraftPick): string => {
      if (!seasonData) return `Team ${pick.roster_id}`;
      const roster = seasonData.rosters.find(
        (r) => r.roster_id === pick.roster_id
      );
      if (!roster) return `Team ${pick.roster_id}`;
      return getTeamName(roster);
    },
    [seasonData, getTeamName]
  );

  if (isLoadingSeasons) {
    return (
      <PageSection>
        <h2>Previous Seasons</h2>
        <LoadingMessage>Loading seasons...</LoadingMessage>
      </PageSection>
    );
  }

  if (seasons.length === 0) {
    return (
      <PageSection>
        <h2>Previous Seasons</h2>
        <EmptyState>No previous seasons found.</EmptyState>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <h2>Previous Seasons</h2>

      <SeasonSelectorRow>
        <label htmlFor="season-select">Season</label>
        <SeasonSelect
          id="season-select"
          value={selectedLeagueId}
          onChange={(e) => {
            previousSeasonsStore.setSelectedLeagueId(e.target.value);
            setActiveTab("standings");
          }}
        >
          {seasons.map((s) => (
            <option key={s.leagueId} value={s.leagueId}>
              {s.year}
            </option>
          ))}
        </SeasonSelect>
      </SeasonSelectorRow>

      <TabBar>
        {(["standings", "teams", "trades", "draft"] as Tab[]).map((tab) => (
          <TabButton
            key={tab}
            $isActive={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </TabButton>
        ))}
      </TabBar>

      <ContentArea>
        {isLoadingData && (
          <LoadingMessage>Loading {selectedYear} data...</LoadingMessage>
        )}

        {!isLoadingData && seasonData && activeTab === "standings" && (
          <StandingsView
            rosters={seasonData.rosters}
            getTeamName={getTeamName}
            getOwnerName={getOwnerName}
          />
        )}

        {!isLoadingData && seasonData && activeTab === "teams" && (
          <TeamsView
            rosters={seasonData.rosters}
            getTeamName={getTeamName}
            getOwnerName={getOwnerName}
            players={playersStore.players}
          />
        )}

        {!isLoadingData && seasonData && activeTab === "trades" && (
          <TradesView
            trades={seasonData.trades}
            year={selectedYear}
            players={playersStore.players}
            getRosterName={getRosterName}
            visibleCount={visibleTrades}
            onLoadMore={() => setVisibleTrades((n) => n + ITEMS_PER_PAGE)}
          />
        )}

        {!isLoadingData && seasonData && activeTab === "draft" && (
          <DraftView
            picks={seasonData.draftPicks}
            year={selectedYear}
            getPickTeamName={getPickTeamName}
          />
        )}
      </ContentArea>
    </PageSection>
  );
});

export default PreviousSeasons;
