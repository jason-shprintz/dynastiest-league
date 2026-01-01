/**
 * TradeCard Component
 * Displays a single trade transaction with teams and items involved
 */

import type { Transaction, Player } from "../../types/sleeper";
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
}

/**
 * Format a timestamp into a readable date string
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
const formatDraftPick = (pick: {
  season: string;
  round: number;
  roster_id: number;
}): string => {
  return `${pick.season} Round ${pick.round} Pick`;
};

/**
 * Get items acquired by a specific roster in a trade
 */
interface TradeItems {
  players: string[];
  picks: Array<{ season: string; round: number; roster_id: number }>;
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
export const TradeCard = ({ trade, players, getRosterName }: TradeCardProps) => {
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

          return (
            <>
              {index > 0 && <TradeArrow key={`arrow-${index}`}>⇄</TradeArrow>}
              <TeamSection key={rosterId}>
                <TeamName>{getRosterName(rosterId)}</TeamName>
                <ItemsList>
                  <ItemsTitle>Received:</ItemsTitle>
                  {!hasItems && <EmptyItems>Nothing</EmptyItems>}
                  {items.players.map((playerName, idx) => (
                    <Item key={`player-${idx}`}>• {playerName}</Item>
                  ))}
                  {items.picks.map((pick, idx) => (
                    <Item key={`pick-${idx}`}>• {formatDraftPick(pick)}</Item>
                  ))}
                </ItemsList>
              </TeamSection>
            </>
          );
        })}
      </TradeParties>
    </TradeCardContainer>
  );
};
