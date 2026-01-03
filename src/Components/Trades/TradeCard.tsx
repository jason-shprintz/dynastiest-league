/**
 * TradeCard Component
 * Displays a single trade transaction with teams and items involved
 */

import { Fragment } from "react";
import type { Transaction, Player } from "../../types/sleeper";
import type { TradeAnalysis } from "../../stores/TradeAnalysisStore";
import {
  TradeCardContainer,
  TradeHeader,
  TradeDate,
  TradeStatus,
  TradeParties,
  TradeArrow,
  TeamSection,
  TeamName,
  ItemsList,
  ItemsTitle,
  Item,
  EmptyItems,
} from "./TradeCard.styles";

interface TradeCardProps {
  trade: Transaction;
  players: Record<string, Player>;
  getRosterName: (rosterId: number) => string;
  analysis?: TradeAnalysis | null;
  isLoadingAnalysis?: boolean;
}

/**
 * Format a timestamp into a readable date string
 * @param timestamp - Unix timestamp in milliseconds from Sleeper API
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get player name from player ID
 */
const getPlayerName = (playerId: string, players: Record<string, Player>): string => {
  const player = players[playerId];
  if (!player) return `Player ${playerId}`;
  return `${player.full_name} (${player.position}${player.team ? ` - ${player.team}` : ""})`;
};

/**
 * Format a draft pick description
 */
const formatDraftPick = (
  pick: {
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id?: number;
    owner_id?: number;
  },
  getRosterName: (rosterId: number) => string
): string => {
  const baseDescription = `${pick.season} Round ${pick.round} Pick`;
  if (typeof pick.previous_owner_id === "number") {
    return `${baseDescription} (from ${getRosterName(pick.previous_owner_id)})`;
  }
  return baseDescription;
};

/**
 * Get items acquired by a specific roster in a trade
 */
interface TradeItems {
  players: string[];
  picks: Array<{
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id?: number;
    owner_id?: number;
  }>;
}

const getTradeItems = (
  trade: Transaction,
  rosterId: number,
  players: Record<string, Player>
): TradeItems => {
  const items: TradeItems = {
    players: [],
    picks: [],
  };

  // Get players added to this roster
  if (trade.adds) {
    Object.entries(trade.adds).forEach(([playerId, addedToRosterId]) => {
      if (addedToRosterId === rosterId) {
        items.players.push(getPlayerName(playerId, players));
      }
    });
  }

  // Get draft picks added to this roster
  if (trade.draft_picks) {
    trade.draft_picks.forEach((pick) => {
      if (pick.owner_id === rosterId) {
        items.picks.push(pick);
      }
    });
  }

  return items;
};

/**
 * TradeCard component that displays trade details in a card format
 */
export const TradeCard = ({ 
  trade, 
  players, 
  getRosterName,
  analysis,
  isLoadingAnalysis,
}: TradeCardProps) => {
  // Filter to only the rosters involved in the trade
  const involvedRosters = trade.roster_ids;

  return (
    <TradeCardContainer>
      <TradeHeader>
        <TradeDate>{formatDate(trade.created)}</TradeDate>
        <TradeStatus>{trade.status}</TradeStatus>
      </TradeHeader>

      <TradeParties>
        {involvedRosters.map((rosterId, index) => {
          const items = getTradeItems(trade, rosterId, players);
          const hasItems = items.players.length > 0 || items.picks.length > 0;
          const teamName = getRosterName(rosterId);
          const teamAnalysis = analysis?.teams?.[String(rosterId)];

          return (
            <Fragment key={rosterId}>
              {index > 0 && <TradeArrow>⇄</TradeArrow>}
              <TeamSection>
                <TeamName>
                  {teamName}
                  {teamAnalysis && (
                    <span style={{ marginLeft: "8px", color: "#4CAF50" }}>
                      Grade: {teamAnalysis.grade}
                    </span>
                  )}
                </TeamName>
                <ItemsList>
                  <ItemsTitle>Received:</ItemsTitle>
                  {!hasItems && <EmptyItems>Nothing</EmptyItems>}
                  {items.players.map((playerName) => (
                    <Item key={playerName}>• {playerName}</Item>
                  ))}
                  {items.picks.map((pick) => (
                    <Item
                      key={`${pick.season}-${pick.round}-${pick.roster_id}`}
                    >
                      • {formatDraftPick(pick, getRosterName)}
                    </Item>
                  ))}
                </ItemsList>
                {teamAnalysis && (
                  <div style={{ 
                    marginTop: "8px", 
                    fontSize: "14px", 
                    fontStyle: "italic",
                    color: "#666"
                  }}>
                    {teamAnalysis.summary}
                  </div>
                )}
              </TeamSection>
            </Fragment>
          );
        })}
      </TradeParties>

      {/* AI Analysis Section */}
      {isLoadingAnalysis && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: "#f5f5f5",
          borderRadius: "8px",
          textAlign: "center",
          fontStyle: "italic",
          color: "#666",
        }}>
          🎬 Mike & Jim are in the film room analyzing this trade...
        </div>
      )}

      {analysis && (
        <div style={{
          marginTop: "16px",
          padding: "16px",
          background: "#f9f9f9",
          borderRadius: "8px",
        }}>
          <h3 style={{ 
            margin: "0 0 12px 0",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            📺 Mike & Jim's Analysis
          </h3>
          <div style={{ marginBottom: "12px" }}>
            {analysis.conversation.map((msg, idx) => (
              <div 
                key={idx}
                style={{
                  marginBottom: "8px",
                  paddingLeft: msg.speaker === "Jim" ? "20px" : "0",
                }}
              >
                <strong style={{ color: msg.speaker === "Mike" ? "#1976d2" : "#d32f2f" }}>
                  {msg.speaker}:
                </strong>{" "}
                {msg.text}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid #ddd",
            fontWeight: "bold",
            fontSize: "14px",
          }}>
            Bottom Line: {analysis.overall_take}
          </div>
        </div>
      )}
    </TradeCardContainer>
  );
};
