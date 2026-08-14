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

export const DraftBoard = ({
  draft,
  picks,
  analyses,
  getTeamName,
}: DraftBoardProps) => {
  const numRounds = draft.settings.rounds;
  const numTeams = draft.settings.teams;

  // Build column headers (draft slots 1..N)
  const slots = Array.from({ length: numTeams }, (_, i) => i + 1);

  // Build lookup: (round, slot) → pick
  const pickLookup = new Map<string, DraftPick>();
  for (const pick of picks) {
    const slot = pick.draft_slot;
    if (slot <= 0) continue;
    pickLookup.set(`${pick.round}:${slot}`, pick);
  }

  return (
    <BoardWrapper>
      <BoardTable>
        <BoardThead>
          <tr>
            <BoardTh>Round</BoardTh>
            {slots.map((slot) => (
              <BoardTh key={slot}>Slot {slot}</BoardTh>
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
                          teamName={getTeamName(pick.roster_id)}
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
