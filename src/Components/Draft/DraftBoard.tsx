/**
 * DraftBoard
 * Grid of picks organized by round (rows) × team draft slot (columns)
 */

import type { DraftPick, Draft } from '../../types/sleeper';
import type { DraftPickAnalysis } from '../../stores/DraftPickAnalysisStore';
import { DraftPickCard } from './DraftPickCard';
import {
  BoardWrapper,
  BoardTable,
  BoardThead,
  BoardTh,
  RoundLabel,
  BoardTd,
} from './Draft.styles';

interface DraftBoardProps {
  draft: Draft;
  picks: DraftPick[];
  analyses: Map<number, DraftPickAnalysis | null>;
  getTeamName: (rosterId: number) => string;
}

export const DraftBoard = ({ draft, picks, analyses, getTeamName }: DraftBoardProps) => {
  const numRounds = draft.settings.rounds;
  const numTeams = draft.settings.teams;

  // Build a lookup: draft_slot → team name using draft_order if available
  // draft_order maps user_id → draft_slot; we need slot → roster_id
  // Sleeper pick objects have draft_slot field, so we derive the slot→team from picks
  const slotToRosterId = new Map<number, number>();
  for (const pick of picks) {
    if (!slotToRosterId.has(pick.draft_slot ?? 0)) {
      slotToRosterId.set(pick.draft_slot ?? pick.pick_no, pick.roster_id);
    }
  }

  // Build column headers (draft slots 1..N)
  const slots = Array.from({ length: numTeams }, (_, i) => i + 1);

  // Build lookup: (round, slot) → pick
  const pickLookup = new Map<string, DraftPick>();
  for (const pick of picks) {
    const slot = pick.draft_slot ?? ((pick.pick_no - 1) % numTeams) + 1;
    pickLookup.set(`${pick.round}:${slot}`, pick);
  }

  // Get column team name by slot — use first pick we know for this slot
  const getSlotTeamName = (slot: number): string => {
    const rosterId = slotToRosterId.get(slot);
    if (rosterId !== undefined) return getTeamName(rosterId);
    return `Slot ${slot}`;
  };

  return (
    <BoardWrapper>
      <BoardTable>
        <BoardThead>
          <tr>
            <BoardTh>Round</BoardTh>
            {slots.map((slot) => (
              <BoardTh key={slot}>{getSlotTeamName(slot)}</BoardTh>
            ))}
          </tr>
        </BoardThead>
        <tbody>
          {Array.from({ length: numRounds }, (_, roundIdx) => {
            const round = roundIdx + 1;
            return (
              <tr key={round}>
                <RoundLabel>{round}</RoundLabel>
                {slots.map((slot) => {
                  const pick = pickLookup.get(`${round}:${slot}`);
                  return (
                    <BoardTd key={slot}>
                      {pick ? (
                        <DraftPickCard
                          pick={pick}
                          analysis={analyses.get(pick.pick_no)}
                        />
                      ) : null}
                    </BoardTd>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BoardTable>
    </BoardWrapper>
  );
};
