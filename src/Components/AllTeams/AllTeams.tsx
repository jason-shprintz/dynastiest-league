/**
 * All Teams Component
 * Displays all teams in the league with expandable cards showing roster details
 */

import { useState, useEffect, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { DEFAULT_LEAGUE_ID } from "../../constants";
import type { Roster, User } from "../../types/sleeper";
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
 * Get user avatar URL from Sleeper CDN
 */
const getAvatarUrl = (avatar: string | null): string | null => {
  if (!avatar) return null;
  return `https://sleepercdn.com/avatars/thumbs/${avatar}`;
};

/**
 * Get bench players (players not in starters or reserve)
 */
const getBenchPlayers = (roster: Roster): string[] => {
  const startersSet = new Set(roster.starters);
  const reserveSet = new Set(roster.reserve || []);

  return roster.players.filter(
    (playerId) => !startersSet.has(playerId) && !reserveSet.has(playerId)
  );
};

/**
 * Get taxi squad players from roster metadata
 */
const getTaxiPlayers = (roster: Roster): string[] => {
  const metadata = roster.metadata as { taxi?: string[] } | null;
  return metadata?.taxi || [];
};

/**
 * Format team record as "W-L" or "W-L-T" if there are ties
 */
const formatRecord = (wins: number, losses: number, ties: number): string => {
  return `${wins}-${losses}${ties > 0 ? `-${ties}` : ""}`;
};

/**
 * Sort teams by standings (wins descending, then losses ascending, then ties descending)
 */
const sortByStandings = (teams: TeamData[]): TeamData[] => {
  return [...teams].sort((a, b) => {
    // First sort by wins (descending)
    if (a.roster.settings.wins !== b.roster.settings.wins) {
      return b.roster.settings.wins - a.roster.settings.wins;
    }
    // If wins are equal, sort by losses (ascending)
    if (a.roster.settings.losses !== b.roster.settings.losses) {
      return a.roster.settings.losses - b.roster.settings.losses;
    }
    // If losses are equal, sort by ties (descending)
    return b.roster.settings.ties - a.roster.settings.ties;
  });
};

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

    useEffect(() => {
      // Load all basic league data
      store.loadAllLeagueData(leagueId);
    }, [store, leagueId]);

    const handleTeamClick = useCallback(
      (rosterId: number) => {
        // If clicking on the already expanded team, collapse it
        // Otherwise, expand the clicked team
        setExpandedTeamId(expandedTeamId === rosterId ? null : rosterId);
      },
      [expandedTeamId]
    );

    if (store.rostersStore.isLoading || store.usersStore.isLoading) {
      return <LoadingMessage>Loading teams...</LoadingMessage>;
    }

    if (store.rostersStore.error) {
      return <LoadingMessage>Error loading teams</LoadingMessage>;
    }

    if (store.usersStore.error) {
      return <LoadingMessage>Error loading users</LoadingMessage>;
    }

    const teams = sortByStandings(
      store.rostersStore.rosters.map((roster) => ({
        roster,
        user: store.usersStore.getUserById(roster.owner_id),
      }))
    );

    if (teams.length === 0) {
      return <LoadingMessage>No teams found</LoadingMessage>;
    }

    return (
      <TeamsSection>
        <TeamsGrid>
          {teams.map(({ roster, user }) => {
            const isExpanded = expandedTeamId === roster.roster_id;
            const record = formatRecord(
              roster.settings.wins,
              roster.settings.losses,
              roster.settings.ties
            );
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
                    <TeamRecord>Points: {roster.settings.fpts}</TeamRecord>
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
