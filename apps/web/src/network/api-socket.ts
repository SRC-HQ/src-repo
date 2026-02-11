import { io, Socket } from 'socket.io-client';
import { API_SOCKET_URL } from '../game/constants';
import { useGameStore } from '../store/gameStore';

type GamePhase = 'preparation' | 'resolution' | 'distribution';

interface GameStatePayload {
  roundId: number;
  phase: GamePhase;
  phaseStartedAt: number;
  phaseEndsAt: number;
  totalPot: string;
  sperms: { spermId: number; totalBets: string; bettorCount: number }[];
  commitment?: string;
  winner?: number;
}

interface PhaseUpdatePayload {
  roundId: number;
  phase: GamePhase;
  startedAt: number;
  endsAt: number;
  commitment?: string;
  winner?: number;
  totalPot?: string;
}

interface PoolUpdatePayload {
  roundId: number;
  spermId: number;
  totalBets: string;
  bettorCount: number;
  totalPot: string;
}

class ApiGameSocket {
  private socket: Socket | null = null;

  connect() {
    console.log('[ENV] NEXT_PUBLIC_PROGRAM_ID:', process.env.NEXT_PUBLIC_PROGRAM_ID);
    console.log('[ENV] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('[ENV] NEXT_PUBLIC_WS_URL:', process.env.NEXT_PUBLIC_WS_URL);
    console.log('[ENV] Resolved API_SOCKET_URL:', API_SOCKET_URL);

    if (!API_SOCKET_URL || API_SOCKET_URL === 'MOCK') return;

    const base = API_SOCKET_URL.replace(/\/$/, '');
    const url = base.endsWith('/game') ? base : `${base}/game`;
    const httpUrl = url.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');

    this.socket = io(httpUrl, { path: '/socket.io', transports: ['websocket'] });

    this.socket.on('connect_error', (err) => {
      console.error('[ApiGameSocket] Connection error:', err.message);
    });

    this.socket.on('game:state', (data: GameStatePayload) => {
      console.log('[ApiGameSocket] game:state', data.phase, data.roundId);
      useGameStore.getState().setApiGameState({
        phase: data.phase,
        roundId: data.roundId,
        phaseStartedAt: data.phaseStartedAt,
        phaseEndsAt: data.phaseEndsAt,
        totalPot: data.totalPot ?? '0',
      });
    });

    this.socket.on('phase:update', (data: PhaseUpdatePayload) => {
      console.log('[ApiGameSocket] phase:update', data.phase, data.roundId);
      useGameStore.getState().setApiGameState({
        phase: data.phase,
        roundId: data.roundId,
        phaseStartedAt: data.startedAt,
        phaseEndsAt: data.endsAt,
        totalPot: data.totalPot ?? useGameStore.getState().apiTotalPot,
      });
    });

    this.socket.on('pool:update', (data: PoolUpdatePayload) => {
      useGameStore.getState().setApiTotalPot(data.totalPot);
    });

    this.socket.on('round:result', () => {});

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
