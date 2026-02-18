import { io, Socket } from 'socket.io-client';
import { API_SOCKET_URL } from '../game/constants';
import { useGameStore } from '../store/gameStore';
import type { SpermRaceParams } from '../store/gameStore';

type GamePhase = 'preparation' | 'resolution' | 'distribution';

interface SpermPoolState {
  spermId: number;
  totalBets: string;
  bettorCount: number;
}

interface GameStatePayload {
  roundId: number;
  phase: GamePhase;
  phaseStartedAt: number;
  phaseEndsAt: number;
  totalPot: string;
  sperms?: SpermPoolState[];
  commitment?: string;
  winner?: number;
  raceParams?: SpermRaceParams[];
  leaderboard?: number[];
}

interface PhaseUpdatePayload {
  roundId: number;
  phase: GamePhase;
  startedAt: number;
  endsAt: number;
  commitment?: string;
  winner?: number;
  totalPot?: string;
  raceParams?: SpermRaceParams[];
  leaderboard?: number[];
}

interface PoolUpdatePayload {
  roundId: number;
  spermId: number;
  totalBets: string;
  bettorCount: number;
  totalPot: string;
}

interface RoundResultPayload {
  roundId: number;
  winnerId: number;
  totalPot: string;
  isBabyKingHit: boolean;
  raceParams?: SpermRaceParams[];
  leaderboard?: number[];
}

const BUFFER_ANIMATION_THRESHOLD_MS = 5000;

function shouldBufferDistribution(
  phaseStartedAt: number,
  phaseEndsAt: number,
): boolean {
  if (phaseStartedAt <= 0 || phaseEndsAt <= 0) return false;
  const duration = phaseEndsAt - phaseStartedAt;
  const elapsed = Date.now() - phaseStartedAt;
  const remaining = duration - elapsed;
  return remaining > 0 && remaining < BUFFER_ANIMATION_THRESHOLD_MS;
}

class ApiGameSocket {
  private socket: Socket | null = null;

  connect() {
    if (!API_SOCKET_URL || API_SOCKET_URL === 'MOCK') return;

    const base = API_SOCKET_URL.replace(/\/$/, '');
    const url = base.endsWith('/game') ? base : `${base}/game`;
    const httpUrl = url.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');

    this.socket = io(httpUrl, { path: '/socket.io', transports: ['websocket'] });

    this.socket.on('connect_error', (err) => {
      console.error('[ApiGameSocket] Connection error:', err.message);
    });

    this.socket.on('game:state', (data: GameStatePayload) => {
      useGameStore.getState().setApiGameState({
        phase: data.phase,
        roundId: data.roundId,
        phaseStartedAt: data.phaseStartedAt,
        phaseEndsAt: data.phaseEndsAt,
        totalPot: data.totalPot ?? '0',
        sperms: data.sperms,
        raceParams: data.raceParams,
        leaderboard: data.leaderboard,
      });
    });

    this.socket.on('phase:update', (data: PhaseUpdatePayload) => {
      const store = useGameStore.getState();
      const isNewRound = data.roundId !== store.apiRoundId;
      const totalPot =
        data.totalPot ?? (data.phase === 'preparation' ? '0' : store.apiTotalPot);

      if (data.phase === 'distribution') {
        const raceStartedAt = store.apiPhaseStartedAt;
        const raceEndsAt = store.apiPhaseEndsAt;
        if (
          store.mode === 'RACE' &&
          shouldBufferDistribution(raceStartedAt, raceEndsAt)
        ) {
          store.setPendingPhaseEvent({
            phase: data.phase,
            roundId: data.roundId,
            startedAt: data.startedAt,
            endsAt: data.endsAt,
            totalPot,
            leaderboard: data.leaderboard,
          });
          return;
        }
      }

      if (isNewRound) store.resetApiStateForNewRound();
      store.setApiGameState({
        phase: data.phase,
        roundId: data.roundId,
        phaseStartedAt: data.startedAt,
        phaseEndsAt: data.endsAt,
        totalPot,
        raceParams: data.raceParams,
        leaderboard: data.leaderboard,
      });
    });

    this.socket.on('pool:update', (data: PoolUpdatePayload) => {
      const store = useGameStore.getState();
      if (data.roundId !== store.apiRoundId) return;
      store.setApiTotalPot(data.totalPot);
      store.updateSpermPool(data.spermId, data.totalBets, data.bettorCount);
    });

    this.socket.on('round:result', (data: RoundResultPayload) => {
      if (data.roundId !== useGameStore.getState().apiRoundId) return;
      if (data.raceParams?.length && data.leaderboard?.length) {
        useGameStore.getState().setRaceResult(data.raceParams, data.leaderboard);
      }
    });

    this.socket.on('error', (err: { code: string; message: string }) => {
      console.error('[ApiGameSocket] Error:', err);
    });

    this.socket.on('disconnect', () => {});
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const apiGameSocket = new ApiGameSocket();
