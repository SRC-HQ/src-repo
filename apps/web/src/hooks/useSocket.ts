'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  PlaceBetPayload,
  PlaceBetResponse,
  GamePhase,
} from '@sperm-race/shared';
import { useGameStore } from '@/stores/gameStore';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const {
    setConnected,
    setPhase,
    setRoundId,
    setPhaseEndsAt,
    setCommitment,
    setSeed,
    setPositions,
    setWinner,
    setPools,
    setOdds,
    setTotalPool,
    resetForNewRound,
  } = useGameStore();

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    const socket: TypedSocket = io(wsUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('🔌 Connected to game server');
      setIsConnected(true);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from game server');
      setIsConnected(false);
      setConnected(false);
    });

    // Initial game state
    socket.on('game:state', (data) => {
      console.log('📊 Received game state:', data);
      setPhase(data.phase);
      setRoundId(data.roundId);
      setPhaseEndsAt(data.phaseEndsAt);
      setPools(data.pools);
      setTotalPool(data.totalPool);
      if (data.commitment) setCommitment(data.commitment);
      if (data.positions) setPositions(data.positions);
      if (data.winner !== undefined) setWinner(data.winner);
    });

    // Phase changes
    socket.on('phase:change', (data) => {
      console.log('🔄 Phase change:', data.phase);
      setPhase(data.phase);
      setRoundId(data.roundId);
      setPhaseEndsAt(data.endsAt);

      if (data.commitment) {
        setCommitment(data.commitment);
      }

      // Reset for new round
      if (data.phase === GamePhase.PREPARATION) {
        resetForNewRound();
      }
    });

    // Race start
    socket.on('race:start', (data) => {
      console.log('🏁 Race starting! Winner:', data.winner);
      setWinner(data.winner);
      setSeed(data.seed);
      setPhaseEndsAt(data.endsAt);
      // Reset positions for race start
      setPositions(Array(10).fill(0));
    });

    // Position updates during race
    socket.on('race:positions', (data) => {
      setPositions(data.positions);
    });

    // Pool updates when someone bets
    socket.on('pool:updated', (data) => {
      setPools(data.pools);
      setOdds(data.odds);
      setTotalPool(data.totalPool);
    });

    // Distribution results
    socket.on('distribution:results', (data) => {
      console.log('💰 Distribution complete:', data);
      // Results are shown in UI
    });

    // Error handling
    socket.on('error', (data) => {
      console.error('❌ Socket error:', data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Place bet function
  const placeBet = useCallback(
    async (payload: PlaceBetPayload): Promise<PlaceBetResponse> => {
      return new Promise((resolve, reject) => {
        if (!socketRef.current?.connected) {
          reject(new Error('Not connected to server'));
          return;
        }

        socketRef.current.emit('bet:place', payload, (response: PlaceBetResponse) => {
          if (response.success) {
            resolve(response);
          } else {
            reject(new Error(response.error || 'Failed to place bet'));
          }
        });
      });
    },
    [],
  );

  return {
    isConnected,
    placeBet,
    socket: socketRef.current,
  };
}
