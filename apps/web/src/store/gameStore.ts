import { create } from 'zustand';
import { GameState, GameMode, RacerState } from '../game/types/GameState';

interface GameStore extends GameState {
  syncState: (state: GameState) => void;
  updateTick: (tick: number, racers: Record<string, Partial<RacerState>>) => void;
  setMode: (mode: GameMode) => void;
  setWalletConnected: (connected: boolean) => void;
  setHasWinnings: (hasWinnings: boolean) => void;
}

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
  syncState: (state) => set(state),
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
  setMode: (mode) => set({ mode }),
  setWalletConnected: (connected: boolean) => set({ isWalletConnected: connected }),
  setHasWinnings: (hasWinnings: boolean) => set({ hasWinnings }),
}));
