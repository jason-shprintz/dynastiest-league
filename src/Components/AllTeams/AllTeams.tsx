/**
 * All Teams Component
 * Displays all teams in the league with expandable cards showing roster details
 */

import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { DEFAULT_LEAGUE_ID } from "../../constants";
import type { Roster, User } from "../../types/sleeper";
import { mockRosters, mockUsers } from "./mockData";
import {
  TeamsSection,
  TeamsGrid,
  TeamCard,
  TeamSummary,
  TeamAvatar,
  TeamInfo,
  TeamName,
  UserName,
  TeamRecord,
  TeamDetails,
  RosterSection,
  RosterSectionTitle,
  PlayersList,
  PlayerChip,
  EmptyState,
  LoadingMessage,
} from "./AllTeams.styles";

interface TeamData {
  roster: Roster;
  user: User | undefined;
}

interface AllTeamsProps {
  leagueId?: string;
}

/**
 * Component that displays all teams in the league
 * Each team is shown in a card with summary information
 * Cards can be expanded to show roster details (starters, bench, IR, taxi)
 * Only one team can be expanded at a time
 */
export const AllTeams = observer(
  ({ leagueId = DEFAULT_LEAGUE_ID }: AllTeamsProps) => {
    const store = useStore();
    const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
    const [useMockData, setUseMockData] = useState(false);

    useEffect(() => {
      // Load all basic league data
      const loadData = async () => {
        try {
          await store.loadAllLeagueData(leagueId);
          // If data fails to load (empty arrays), use mock data
          setTimeout(() => {
            if (
              store.rostersStore.rosters.length === 0 &&
              !store.rostersStore.isLoading &&
              store.rostersStore.error
            ) {
              setUseMockData(true);
            }
          }, 1000);
        } catch {
          setUseMockData(true);
        }
      };
      loadData();
    }, [store, leagueId]);

    const handleTeamClick = (rosterId: number) => {
      // If clicking on the already expanded team, collapse it
      // Otherwise, expand the clicked team
      setExpandedTeamId(expandedTeamId === rosterId ? null : rosterId);
    };

    const getAvatarUrl = (avatar: string | null) => {
      if (!avatar) return null;
      return `https://sleepercdn.com/avatars/thumbs/${avatar}`;
    };

    const getTeamData = (): TeamData[] => {
      if (useMockData) {
        return mockRosters.map((roster) => ({
          roster,
          user: mockUsers.find((u) => u.user_id === roster.owner_id),
        }));
      }
      return store.rostersStore.rosters.map((roster) => ({
        roster,
        user: store.usersStore.getUserById(roster.owner_id),
      }));
    };

    const getBenchPlayers = (roster: Roster): string[] => {
      // Bench players are in the players array but not in starters or reserve
      const startersSet = new Set(roster.starters);
      const reserveSet = new Set(roster.reserve || []);

      return roster.players.filter(
        (playerId) => !startersSet.has(playerId) && !reserveSet.has(playerId)
      );
    };

    const getTaxiPlayers = (roster: Roster): string[] => {
      // Taxi squad is stored in metadata if available
      const metadata = roster.metadata as { taxi?: string[] } | null;
      return metadata?.taxi || [];
    };

    if (!useMockData && (store.rostersStore.isLoading || store.usersStore.isLoading)) {
      return <LoadingMessage>Loading teams...</LoadingMessage>;
    }

    if (!useMockData && store.rostersStore.error && store.rostersStore.rosters.length === 0) {
      return <LoadingMessage>Loading teams...</LoadingMessage>;
    }

    if (!useMockData && store.usersStore.error && store.usersStore.users.length === 0) {
      return <LoadingMessage>Loading teams...</LoadingMessage>;
    }

    const teams = getTeamData();

    if (teams.length === 0) {
      return <LoadingMessage>No teams found</LoadingMessage>;
    }

    return (
      <TeamsSection>
        <TeamsGrid>
          {teams.map(({ roster, user }) => {
            const isExpanded = expandedTeamId === roster.roster_id;
            const record = `${roster.settings.wins}-${roster.settings.losses}${roster.settings.ties > 0 ? `-${roster.settings.ties}` : ""}`;
            const benchPlayers = getBenchPlayers(roster);
            const taxiPlayers = getTaxiPlayers(roster);

            return (
              <TeamCard
                key={roster.roster_id}
                $isExpanded={isExpanded}
                onClick={() => handleTeamClick(roster.roster_id)}
              >
                <TeamSummary>
                  <TeamAvatar>
                    {user?.avatar ? (
                      <img
                        src={getAvatarUrl(user.avatar) || ""}
                        alt={user.display_name}
                      />
                    ) : (
                      <span style={{ fontSize: "1.5rem" }}>👤</span>
                    )}
                  </TeamAvatar>
                  <TeamInfo>
                    <TeamName>
                      {user?.metadata?.team_name || "Team " + roster.roster_id}
                    </TeamName>
                    <UserName>{user?.display_name || "Unknown User"}</UserName>
                    <TeamRecord>Record: {record}</TeamRecord>
                  </TeamInfo>
                </TeamSummary>

                {isExpanded && (
                  <TeamDetails>
                    {/* Starters */}
                    <RosterSection>
                      <RosterSectionTitle>
                        Starters ({roster.starters.length})
                      </RosterSectionTitle>
                      {roster.starters.length > 0 ? (
                        <PlayersList>
                          {roster.starters.map((playerId) => (
                            <PlayerChip key={playerId}>{playerId}</PlayerChip>
                          ))}
                        </PlayersList>
                      ) : (
                        <EmptyState>No starters</EmptyState>
                      )}
                    </RosterSection>

                    {/* Bench */}
                    <RosterSection>
                      <RosterSectionTitle>
                        Bench ({benchPlayers.length})
                      </RosterSectionTitle>
                      {benchPlayers.length > 0 ? (
                        <PlayersList>
                          {benchPlayers.map((playerId) => (
                            <PlayerChip key={playerId}>{playerId}</PlayerChip>
                          ))}
                        </PlayersList>
                      ) : (
                        <EmptyState>No bench players</EmptyState>
                      )}
                    </RosterSection>

                    {/* IR (Reserve) */}
                    {roster.reserve && roster.reserve.length > 0 && (
                      <RosterSection>
                        <RosterSectionTitle>
                          IR ({roster.reserve.length})
                        </RosterSectionTitle>
                        <PlayersList>
                          {roster.reserve.map((playerId) => (
                            <PlayerChip key={playerId}>{playerId}</PlayerChip>
                          ))}
                        </PlayersList>
                      </RosterSection>
                    )}

                    {/* Taxi Squad */}
                    {taxiPlayers.length > 0 && (
                      <RosterSection>
                        <RosterSectionTitle>
                          Taxi Squad ({taxiPlayers.length})
                        </RosterSectionTitle>
                        <PlayersList>
                          {taxiPlayers.map((playerId) => (
                            <PlayerChip key={playerId}>{playerId}</PlayerChip>
                          ))}
                        </PlayersList>
                      </RosterSection>
                    )}
                  </TeamDetails>
                )}
              </TeamCard>
            );
          })}
        </TeamsGrid>
      </TeamsSection>
    );
  }
);
