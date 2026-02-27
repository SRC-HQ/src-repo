export type GameMode = 'PREPARATION' | 'RACE' | 'DISTRIBUTION';

export interface RacerState {
  id: string;
  x: number;
  finished: boolean;
}

export interface GameState {
  mode: GameMode;
  tick: number;
  racers: Record<string, RacerState>;
  startTime: number;
  isWalletConnected?: boolean;
  hasWinnings?: boolean;
  lastDistribution?: any; // Define proper type if possible, or use any for now
  isStateSynced?: boolean;
  serverFinished?: boolean;
  debugFreezeAtFinish?: boolean;
}
