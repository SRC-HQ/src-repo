import { create } from 'zustand';
import { GameState, GameMode, RacerState } from '../game/types/GameState';

export interface SpermPoolState {
  spermId: number;
  totalBets: string;
  bettorCount: number;
}

export interface RaceSegment {
  from: number;
  to: number;
  mult: number;
}

export interface SpermRaceParams {
  baseSpeed: number;
  segments?: RaceSegment[];
}

export interface ApiGameState {
  phase: string;
  roundId: number;
  phaseStartedAt: number;
  phaseEndsAt: number;
  totalPot: string;
  sperms?: SpermPoolState[];
  raceParams?: SpermRaceParams[];
  leaderboard?: number[];
}

interface GameStore extends GameState {
  apiPhase: string;
  apiRoundId: number;
  apiPhaseStartedAt: number;
  apiPhaseEndsAt: number;
  /** Client time when we received resolution phase (avoids clock skew) */
  apiPhaseReceivedAt: number;
  apiTotalPot: string;
  /** Pool state per sperm (for bettorCount in race/distribution) */
  apiSperms: SpermPoolState[];
  raceParams: SpermRaceParams[] | null;
  leaderboard: number[] | null;
  /** Buffered distribution phase (apply after race animation completes) */
  pendingPhaseEvent: { phase: string; roundId: number; startedAt: number; endsAt: number; totalPot?: string; leaderboard?: number[] } | null;
  syncState: (state: GameState) => void;
  updateTick: (tick: number, racers: Record<string, Partial<RacerState>>) => void;
  setMode: (mode: GameMode) => void;
  setApiGameState: (state: ApiGameState) => void;
  setApiTotalPot: (totalPot: string) => void;
  updateSpermPool: (spermId: number, totalBets: string, bettorCount: number) => void;
  setRaceResult: (raceParams: SpermRaceParams[], leaderboard: number[]) => void;
  setPendingPhaseEvent: (event: GameStore['pendingPhaseEvent']) => void;
  applyPendingPhaseEvent: () => void;
  resetApiStateForNewRound: () => void;
  setWalletConnected: (connected: boolean) => void;
  setHasWinnings: (hasWinnings: boolean) => void;
}

const PHASE_TO_MODE: Record<string, GameMode> = {
  preparation: 'PREPARATION',
  resolution: 'RACE',
  distribution: 'DISTRIBUTION',
};

const initialState: GameState = {
  mode: 'PREPARATION',
  tick: 0,
  racers: {},
  startTime: 0,
  isWalletConnected: false,
  hasWinnings: false,
  lastDistribution: undefined,
  isStateSynced: false,
  serverFinished: false,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  apiPhase: '',
  apiRoundId: 0,
  apiPhaseStartedAt: 0,
  apiPhaseEndsAt: 0,
  apiPhaseReceivedAt: 0,
  apiTotalPot: '0',
  apiSperms: [],
  raceParams: null,
  leaderboard: null,
  pendingPhaseEvent: null,
  syncState: (state) =>
    set((prev) => {
      // When API has state, mode comes only from socket – don't let simulation overwrite
      if (prev.apiPhaseEndsAt > 0) {
        return { ...state, mode: prev.mode };
      }
      return state;
    }),
  updateTick: (tick, updatedRacers) =>
    set((state) => {
      const newRacers = { ...state.racers };
      let allFinished = true;

      // Efficiently update only changed racers
      for (const id in updatedRacers) {
        if (newRacers[id]) {
          newRacers[id] = { ...newRacers[id], ...updatedRacers[id] };
        }
      }
      
      // Check if all racers are finished
      for (const id in newRacers) {
          if (!newRacers[id].finished) {
              allFinished = false;
              break;
          }
      }

      return { tick, racers: newRacers, serverFinished: allFinished };
    }),
  setMode: (mode) =>
    set((prev) => {
      // When API has state, mode comes only from socket – ignore simulation
      if (prev.apiPhaseEndsAt > 0) return prev;
      return { mode };
    }),
  setApiGameState: ({ phase, roundId, phaseStartedAt, phaseEndsAt, totalPot, sperms, raceParams, leaderboard }) =>
    set((prev) => {
      const isResolution = phase === 'resolution';
      return {
        apiPhase: phase,
        apiRoundId: roundId,
        apiPhaseStartedAt: phaseStartedAt,
        apiPhaseEndsAt: phaseEndsAt,
        apiPhaseReceivedAt: isResolution ? Date.now() : prev.apiPhaseReceivedAt,
        apiTotalPot: totalPot ?? '0',
        apiSperms: sperms ?? prev.apiSperms,
        raceParams: raceParams ?? prev.raceParams,
        leaderboard: leaderboard ?? prev.leaderboard,
        mode: PHASE_TO_MODE[phase] ?? 'PREPARATION',
        isStateSynced: true,
      };
    }),
  setApiTotalPot: (totalPot) => set({ apiTotalPot: totalPot }),
  updateSpermPool: (spermId, totalBets, bettorCount) =>
    set((state) => {
      const sperms = [...(state.apiSperms || [])];
      const idx = sperms.findIndex((s) => s.spermId === spermId);
      const entry = { spermId, totalBets, bettorCount };
      if (idx >= 0) sperms[idx] = entry;
      else sperms.push(entry);
      sperms.sort((a, b) => a.spermId - b.spermId);
      return { apiSperms: sperms };
    }),
  setRaceResult: (raceParams, leaderboard) =>
    set((prev) => ({
      raceParams,
      leaderboard,
      apiPhaseReceivedAt:
        prev.mode === 'RACE' && prev.apiPhaseReceivedAt === 0
          ? Date.now()
          : prev.apiPhaseReceivedAt,
    })),
  setPendingPhaseEvent: (event) => set({ pendingPhaseEvent: event }),
  applyPendingPhaseEvent: () => {
    const { pendingPhaseEvent } = get();
    if (!pendingPhaseEvent) return;
    set({
      apiPhase: pendingPhaseEvent.phase,
      apiPhaseStartedAt: pendingPhaseEvent.startedAt,
      apiPhaseEndsAt: pendingPhaseEvent.endsAt,
      apiTotalPot: pendingPhaseEvent.totalPot ?? get().apiTotalPot,
      leaderboard: pendingPhaseEvent.leaderboard ?? get().leaderboard,
      mode: 'DISTRIBUTION',
      pendingPhaseEvent: null,
    });
  },
  resetApiStateForNewRound: () =>
    set({
      apiTotalPot: '0',
      apiSperms: [],
      tick: 0,
      racers: {},
      raceParams: null,
      leaderboard: null,
      pendingPhaseEvent: null,
      apiPhaseReceivedAt: 0,
    }),
  setWalletConnected: (connected: boolean) => set({ isWalletConnected: connected }),
  setHasWinnings: (hasWinnings: boolean) => set({ hasWinnings }),
}));
