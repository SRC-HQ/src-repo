import { create } from 'zustand';
import { GamePhase, PoolState, SPERM_COUNT } from '@sperm-race/shared';

interface UserBet {
  spermId: number;
  amount: number;
}

interface GameState {
  // Connection
  isConnected: boolean;
  setConnected: (connected: boolean) => void;

  // Game state
  phase: GamePhase;
  roundId: number;
  phaseEndsAt: number;
  commitment: string | null;
  seed: string | null;

  // Race state
  positions: number[];
  winner: number | null;

  // Betting pools (per sperm)
  pools: PoolState[];
  odds: number[];
  totalPool: number;

  // User's bets this round
  userBets: UserBet[];
  selectedSperm: number | null;
  betAmount: string;

  // Actions
  setPhase: (phase: GamePhase) => void;
  setRoundId: (roundId: number) => void;
  setPhaseEndsAt: (endsAt: number) => void;
  setCommitment: (commitment: string | null) => void;
  setSeed: (seed: string | null) => void;
  setPositions: (positions: number[]) => void;
  setWinner: (winner: number | null) => void;
  setPools: (pools: PoolState[]) => void;
  setOdds: (odds: number[]) => void;
  setTotalPool: (total: number) => void;
  addUserBet: (bet: UserBet) => void;
  setSelectedSperm: (spermId: number | null) => void;
  setBetAmount: (amount: string) => void;
  resetForNewRound: () => void;

  // Sync full state from server
  syncState: (state: Partial<GameState>) => void;
}

const initialPools: PoolState[] = Array(SPERM_COUNT)
  .fill(null)
  .map((_, i) => ({
    spermId: i,
    totalBets: 0,
    bettorCount: 0,
    odds: 1,
  }));

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  isConnected: false,
  phase: GamePhase.PREPARATION,
  roundId: 0,
  phaseEndsAt: 0,
  commitment: null,
  seed: null,
  positions: Array(SPERM_COUNT).fill(0),
  winner: null,
  pools: initialPools,
  odds: Array(SPERM_COUNT).fill(1),
  totalPool: 0,
  userBets: [],
  selectedSperm: null,
  betAmount: '',

  // Actions
  setConnected: (connected) => set({ isConnected: connected }),
  setPhase: (phase) => set({ phase }),
  setRoundId: (roundId) => set({ roundId }),
  setPhaseEndsAt: (phaseEndsAt) => set({ phaseEndsAt }),
  setCommitment: (commitment) => set({ commitment }),
  setSeed: (seed) => set({ seed }),
  setPositions: (positions) => set({ positions }),
  setWinner: (winner) => set({ winner }),
  setPools: (pools) => set({ pools }),
  setOdds: (odds) => set({ odds }),
  setTotalPool: (totalPool) => set({ totalPool }),

  addUserBet: (bet) =>
    set((state) => ({
      userBets: [...state.userBets, bet],
    })),

  setSelectedSperm: (selectedSperm) => set({ selectedSperm }),
  setBetAmount: (betAmount) => set({ betAmount }),

  resetForNewRound: () =>
    set({
      positions: Array(SPERM_COUNT).fill(0),
      winner: null,
      userBets: [],
      selectedSperm: null,
      betAmount: '',
      seed: null,
    }),

  syncState: (newState) => set((state) => ({ ...state, ...newState })),
}));
