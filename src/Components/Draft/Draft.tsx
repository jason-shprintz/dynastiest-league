/**
 * Draft Component
 * Container — loads draft data, pick analyses, and team grades; renders the board.
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../stores';
import { DEFAULT_LEAGUE_ID } from '../../constants';
import { fetchDraftPicks } from '../../services/sleeperApi';
import { DraftBoard } from './DraftBoard';
import { TeamDraftGradeCard } from './TeamDraftGradeCard';
import type { DraftPick } from '../../types/sleeper';
import { makeAutoObservable, runInAction } from 'mobx';
import {
  DraftSection,
  SectionDescription,
  LoadingMessage,
  EmptyState,
  FinalGradesPanel,
  FinalGradesTitle,
  GradesGrid,
  LiveStatusPill,
} from './Draft.styles';

// Local observable state for draft picks (not stored in RootStore since it's draft-specific)
class DraftPicksState {
  picks: DraftPick[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async load(draftId: string) {
    if (this.isLoading) return;
    this.isLoading = true;
    this.error = null;
    try {
      const data = await fetchDraftPicks(draftId);
      runInAction(() => {
        this.picks = data;
        this.isLoading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : 'Unknown error';
        this.isLoading = false;
      });
    }
  }
}

// One instance per component render is fine — Draft is a singleton section
const draftPicksState = new DraftPicksState();

interface DraftProps {
  leagueId?: string;
}

const PICKS_REFRESH_INTERVAL_MS = 15000;
const ANALYSES_REFRESH_INTERVAL_MS = 30000;

const Draft = observer(({ leagueId = DEFAULT_LEAGUE_ID }: DraftProps) => {
  const {
    draftStore,
    usersStore,
    rostersStore,
    draftPickAnalysisStore,
    teamDraftGradeStore,
  } = useStore();

  const picksRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analysesRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isTabVisible, setIsTabVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  );
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    usersStore.loadUsers(leagueId);
    rostersStore.loadRosters(leagueId);
    draftStore.loadDrafts(leagueId);
  }, [leagueId, usersStore, rostersStore, draftStore]);

  const draft = draftStore.mostRecentDraft;
  // Derived from MobX observable — access here so the observer tracks it and re-renders fire
  const picksCount = draftPicksState.picks.length;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  const loadPicks = useCallback(async (draftId: string) => {
    await draftPicksState.load(draftId);
    setLastUpdatedAt(Date.now());
  }, []);

  const loadAnalyses = useCallback(
    async (draftId: string) => {
      await draftPickAnalysisStore.loadAnalyses(draftId);
      setLastUpdatedAt(Date.now());
    },
    [draftPickAnalysisStore],
  );

  // Load picks + analyses once whenever draft changes
  useEffect(() => {
    if (!draft) return;
    loadPicks(draft.draft_id);
    loadAnalyses(draft.draft_id);
  }, [draft, loadPicks, loadAnalyses]);

  // Poll while draft is live and tab is visible
  useEffect(() => {
    if (!draft) return;

    const clearPolling = () => {
      if (picksRefreshTimerRef.current) {
        clearInterval(picksRefreshTimerRef.current);
        picksRefreshTimerRef.current = null;
      }
      if (analysesRefreshTimerRef.current) {
        clearInterval(analysesRefreshTimerRef.current);
        analysesRefreshTimerRef.current = null;
      }
    };

    if (draft.status === 'drafting' && isTabVisible) {
      picksRefreshTimerRef.current = setInterval(
        () => loadPicks(draft.draft_id),
        PICKS_REFRESH_INTERVAL_MS,
      );
      analysesRefreshTimerRef.current = setInterval(
        () => loadAnalyses(draft.draft_id),
        ANALYSES_REFRESH_INTERVAL_MS,
      );
    }

    return clearPolling;
  }, [draft, isTabVisible, loadPicks, loadAnalyses]);

  // Reactively load team grades once picks reach the expected total
  // (mirrors worker completion condition: status=complete OR picks.length >= rounds*teams)
  useEffect(() => {
    if (!draft) return;
    const totalExpectedPicks = draft.settings.rounds * draft.settings.teams;
    const isDraftComplete =
      draft.status === 'complete' || picksCount >= totalExpectedPicks;
    if (isDraftComplete) {
      teamDraftGradeStore.loadGrades(draft.draft_id);
    }
  }, [draft, picksCount, teamDraftGradeStore]);

  const getRosterName = useCallback(
    (rosterId: number): string => {
      const roster = rostersStore.rosters.find((r) => r.roster_id === rosterId);
      if (!roster) return `Team ${rosterId}`;
      const user = usersStore.users.find((u) => u.user_id === roster.owner_id);
      if (!user) return `Team ${rosterId}`;
      return user.metadata?.team_name || user.display_name || user.username;
    },
    [rostersStore.rosters, usersStore.users],
  );

  if (draftStore.isLoading || usersStore.isLoading || rostersStore.isLoading) {
    return (
      <DraftSection>
        <h2>Draft</h2>
        <LoadingMessage>Loading draft data...</LoadingMessage>
      </DraftSection>
    );
  }

  if (!draft) {
    return (
      <DraftSection>
        <h2>Draft</h2>
        <EmptyState>No draft found for this league.</EmptyState>
      </DraftSection>
    );
  }

  if (draft.status === 'pre_draft') {
    return (
      <DraftSection>
        <h2>Draft</h2>
        <SectionDescription>
          {draft.settings.teams}-team, {draft.settings.rounds}-round rookie draft
        </SectionDescription>
        <EmptyState>
          🏈 The draft hasn't started yet. Check back when picks start coming in!
        </EmptyState>
      </DraftSection>
    );
  }

  const analyses = draftPickAnalysisStore.getAnalysesForDraft(draft.draft_id);
  const grades = teamDraftGradeStore.getGradesForDraft(draft.draft_id);
  const hasGrades = grades.size > 0;

  // Gather unique roster IDs that have grades for the Final Grades panel
  const gradedRosterIds = Array.from(grades.keys()).sort((a, b) => a - b);

  return (
    <DraftSection>
      <h2>Draft</h2>
      <SectionDescription>
        {draft.settings.teams}-team · {draft.settings.rounds}-round rookie draft ·{' '}
        {draft.status === 'complete' ? (
          '✅ Complete'
        ) : (
          <LiveStatusPill $isLive={isTabVisible}>🔴 Live</LiveStatusPill>
        )}
        {draft.status === 'drafting' && ' · auto-refresh 15s picks / 30s analysis'}
        {draft.status === 'drafting' && lastUpdatedAt && (
          <> · last updated {new Date(lastUpdatedAt).toLocaleTimeString()}</>
        )}
        {draftPicksState.picks.length > 0 && ` · ${draftPicksState.picks.length} picks made`}
      </SectionDescription>

      {/* Final Grades panel — shown once draft completes */}
      {hasGrades && (
        <FinalGradesPanel>
          <FinalGradesTitle>📋 Final Draft Grades</FinalGradesTitle>
          <GradesGrid>
            {gradedRosterIds.map((rosterId) => {
              const grade = grades.get(rosterId);
              if (!grade) return null;
              return (
                <TeamDraftGradeCard
                  key={rosterId}
                  grade={grade}
                  teamName={getRosterName(rosterId)}
                />
              );
            })}
          </GradesGrid>
        </FinalGradesPanel>
      )}

      {/* Draft board */}
      {draftPicksState.isLoading && draftPicksState.picks.length === 0 ? (
        <LoadingMessage>Loading picks...</LoadingMessage>
      ) : draftPicksState.picks.length > 0 ? (
        <DraftBoard
          draft={draft}
          picks={draftPicksState.picks}
          analyses={analyses}
          getTeamName={getRosterName}
        />
      ) : (
        <EmptyState>No picks yet — the board is empty.</EmptyState>
      )}
    </DraftSection>
  );
});

export default Draft;
