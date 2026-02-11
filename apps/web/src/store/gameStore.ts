import { create } from 'zustand';
import { GameState, GameMode, RacerState } from '../game/types/GameState';

export interface ApiGameState {
  phase: string;
  roundId: number;
  phaseStartedAt: number;
  phaseEndsAt: number;
  totalPot: string;
}

interface GameStore extends GameState {
  /** API socket state (phase, countdown, total pot) - used when API is connected */
  apiPhase: string;
  apiRoundId: number;
  apiPhaseStartedAt: number;
  apiPhaseEndsAt: number;
  apiTotalPot: string;
  syncState: (state: GameState) => void;
  updateTick: (tick: number, racers: Record<string, Partial<RacerState>>) => void;
  setMode: (mode: GameMode) => void;
  setApiGameState: (state: ApiGameState) => void;
  setApiTotalPot: (totalPot: string) => void;
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
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  apiPhase: '',
  apiRoundId: 0,
  apiPhaseStartedAt: 0,
  apiPhaseEndsAt: 0,
  apiTotalPot: '0',
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

      // Efficiently update only changed racers
      for (const id in updatedRacers) {
        if (newRacers[id]) {
          newRacers[id] = { ...newRacers[id], ...updatedRacers[id] };
        }
      }

      return { tick, racers: newRacers };
    }),
  setMode: (mode) =>
    set((prev) => {
      // When API has state, mode comes only from socket – ignore simulation
      if (prev.apiPhaseEndsAt > 0) return prev;
      return { mode };
    }),
  setApiGameState: ({ phase, roundId, phaseStartedAt, phaseEndsAt, totalPot }) =>
    set({
      apiPhase: phase,
      apiRoundId: roundId,
      apiPhaseStartedAt: phaseStartedAt,
      apiPhaseEndsAt: phaseEndsAt,
      apiTotalPot: totalPot,
      mode: PHASE_TO_MODE[phase] ?? 'PREPARATION',
    }),
  setApiTotalPot: (totalPot) => set({ apiTotalPot: totalPot }),
  setWalletConnected: (connected: boolean) => set({ isWalletConnected: connected }),
  setHasWinnings: (hasWinnings: boolean) => set({ hasWinnings }),
}));
