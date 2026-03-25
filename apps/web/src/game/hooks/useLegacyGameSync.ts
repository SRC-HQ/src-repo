import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';

declare global {
  interface Window {
    GameBridge: {
      setResults: (results: number[]) => void;
      setRacePhaseData?: (
        phaseStartedAt: number,
        phaseEndsAt: number,
        phaseReceivedAt: number,
        raceParams: {
          baseSpeed: number;
          segments?: { from: number; to: number; mult: number }[];
        }[],
        leaderboard?: number[],
      ) => void;
      startRace: () => void;
      updateBalance: (balance: number) => void;
      setMode: (mode: string) => void;
      onGameReady?: () => void;
      restoreGame?: (
        progress: number,
        elapsed?: number,
        racers?: unknown[],
        startTime?: number,
        serverFinished?: boolean,
      ) => void;
    };
  }
}

export const useLegacyGameSync = (isReady: boolean = false) => {
  const mode = useGameStore((state) => state.mode);
  const startTime = useGameStore((state) => state.startTime);
  const racers = useGameStore((state) => state.racers);
  const isStateSynced = useGameStore((state) => state.isStateSynced);
  const serverFinished = useGameStore((state) => state.serverFinished);
  const lastDistribution = useGameStore((state) => state.lastDistribution) as
    | {
        result?: {
          finalRanking?: number[];
          winnerSpermId?: number;
        };
      }
    | undefined;
  const apiPhaseStartedAt = useGameStore((state) => state.apiPhaseStartedAt);
  const apiPhaseEndsAt = useGameStore((state) => state.apiPhaseEndsAt);
  const apiPhaseReceivedAt = useGameStore((state) => state.apiPhaseReceivedAt);
  const raceParams = useGameStore((state) => state.raceParams);
  const leaderboard = useGameStore((state) => state.leaderboard);
  const prevMode = useRef(mode);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isReady || !window.GameBridge || !isStateSynced || isInitialized.current) return;
    if (!isInitialized.current) {
      console.log('Initial Sync with mode:', mode);

      // Pass results if available (especially for DISTRIBUTION mode)
      if (lastDistribution && lastDistribution.result) {
        // Assuming result.finalRanking or we need to construct the winner list
        // For legacy game, it often expects revealResults to be set
        // In dummy simulation, we might need to mock or map this.
        // game.js expects gameData.revealResults array of racer indices
        // For now, let's try to map if possible, or just ensure setResults is called

        // Map backend winnerSpermId to results if needed, or pass dummy array if legacy expects it
        // In game.js: gameData.revealResults = [1,2,0,4,3,5,6,7,8,9];

        // If we have winners array in lastDistribution, use it.
        // Simulation generates: winnerSpermId.
        // Let's create a simple ranking based on winner

        let results: number[] = [];
        if (
          lastDistribution.result.finalRanking &&
          lastDistribution.result.finalRanking.length > 0
        ) {
          results = lastDistribution.result.finalRanking;
        } else {
          // Fallback/Mock for simulation if not fully populated
          const winner = lastDistribution.result.winnerSpermId ?? 0;
          results = [winner, ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== winner)];
        }

        window.GameBridge.setResults(results);
      }

      window.GameBridge.setMode(mode);

      // If refreshed during RACE, restore state
      if (mode === 'RACE') {
        const now = Date.now();
        const effectiveStart = apiPhaseReceivedAt || apiPhaseStartedAt || startTime;
        const elapsed = now - effectiveStart;
        const duration =
          apiPhaseEndsAt > apiPhaseStartedAt ? apiPhaseEndsAt - apiPhaseStartedAt : 28000;
        const progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));

        if (window.GameBridge.restoreGame) {
          console.log('Restoring race with progress:', progress, 'elapsed:', elapsed);
          const racersList = Object.values(racers || {});
          window.GameBridge.restoreGame(
            progress,
            elapsed,
            racersList,
            effectiveStart,
            serverFinished,
          );
        } else {
          window.GameBridge.startRace();
        }
      }

      isInitialized.current = true;
      prevMode.current = mode;
      return;
    }

    // Handle mode changes
    if (prevMode.current !== mode) {
      if (lastDistribution && lastDistribution.result) {
        let results: number[] = [];
        if (
          lastDistribution.result.finalRanking &&
          lastDistribution.result.finalRanking.length > 0
        ) {
          results = lastDistribution.result.finalRanking;
        } else {
          const winner = lastDistribution.result.winnerSpermId ?? 0;
          results = [winner, ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((x) => x !== winner)];
        }
        window.GameBridge.setResults(results);
      }

      window.GameBridge.setMode(mode);

      if (mode === 'RACE') {
        window.GameBridge.startRace();
      }

      prevMode.current = mode;
    }
  }, [
    mode,
    isReady,
    isStateSynced,
    lastDistribution,
    apiPhaseReceivedAt,
    apiPhaseStartedAt,
    startTime,
    racers,
    serverFinished,
    apiPhaseEndsAt,
  ]);

  // Push race phase data + leaderboard to vanilla game for socket-driven positions and leaderboard
  useEffect(() => {
    if (!isReady || !window.GameBridge?.setRacePhaseData) return;
    if (mode !== 'RACE') return;
    if (apiPhaseStartedAt <= 0 || apiPhaseEndsAt <= 0) return;
    if (!raceParams || raceParams.length < 10) return;

    window.GameBridge.setRacePhaseData(
      apiPhaseStartedAt,
      apiPhaseEndsAt,
      apiPhaseReceivedAt || apiPhaseStartedAt,
      raceParams,
      leaderboard || [],
    );
  }, [
    isReady,
    mode,
    apiPhaseStartedAt,
    apiPhaseEndsAt,
    apiPhaseReceivedAt,
    raceParams,
    leaderboard,
  ]);

  // Sync Balance (if available in store)
  // const balance = useGameStore((state) => state.balance);
  // useEffect(() => {
  //   if (window.GameBridge) window.GameBridge.updateBalance(balance);
  // }, [balance]);
};
