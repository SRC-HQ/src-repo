import { WEBSOCKET_URL } from '../game/constants';
import { useGameStore } from '../store/gameStore';
import { GameState, GameMode, RacerState } from '../game/types/GameState';

type IncomingMessage =
  | { type: 'SYNC_STATE'; state: GameState }
  | { type: 'TICK'; tick: number; racers: Record<string, Partial<RacerState>> }
  | { type: 'MODE_CHANGE'; mode: GameMode };

class GameSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isSimulationMode = false;
  private simulationInterval: NodeJS.Timeout | null = null;

  connect() {
    // If URL is invalid or empty, fallback to simulation mode
    if (WEBSOCKET_URL === 'MOCK' || !WEBSOCKET_URL.startsWith('ws')) {
      console.log('Starting Simulation Mode');
      this.startSimulation();
      return;
    }

    // Avoid double connections
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    if (this.ws) {
      this.ws.close();
    }

    console.log('Connecting to Game Server at', WEBSOCKET_URL);
    try {
      this.ws = new WebSocket(WEBSOCKET_URL);

      this.ws.onopen = () => {
        console.log('Connected to Game Server');
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data: IncomingMessage = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (e) {
          console.error('Failed to parse message', e);
        }
      };

      this.ws.onclose = () => {
        console.log('Disconnected from Game Server');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket Error', error);
        this.ws?.close();
      };
    } catch (e) {
      console.error('Failed to create WebSocket', e);
      this.scheduleReconnect();
    }
  }

  private handleMessage(message: IncomingMessage) {
    const store = useGameStore.getState();
    switch (message.type) {
      case 'SYNC_STATE':
        store.syncState(message.state);
        break;
      case 'TICK':
        store.updateTick(message.tick, message.racers);
        break;
      case 'MODE_CHANGE':
        store.setMode(message.mode);
        break;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;
    console.log('Scheduling reconnect in 3s...');
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, 3000);
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.ws) {
      this.ws.onclose = null; // Prevent reconnect on manual disconnect
      this.ws.close();
      this.ws = null;
    }
    this.stopSimulation();
  }

  // --- Simulation Logic ---
  private lastTickTime: number = 0;
  private pendingTicks: number = 0;
  private readonly TICK_RATE = 50;

  // Public API for Debugging/Admin
  public debugSetMode(mode: GameMode) {
    if (!this.isSimulationMode) return;

    // Load current state or use default
    let state = this.loadSimulationState() || {
      tick: 0,
      mode: 'PREPARATION',
      racers: {},
      startTime: Date.now(),
    };

    // Update mode
    state.mode = mode;
    state.timestamp = Date.now();

    // Adjust state based on target mode
    if (mode === 'PREPARATION') {
      state.tick = 0;
      state.startTime = Date.now() + 5000;
      // Reset racers
      Object.keys(state.racers).forEach((id) => {
        state.racers[id].x = 0;
        state.racers[id].finished = false;
      });
    } else if (mode === 'RACE') {
      state.tick = 100;
      // Ensure racers exist
      if (Object.keys(state.racers).length === 0) {
        for (let i = 0; i < 10; i++) {
          const id = `racer_${i}`;
          state.racers[id] = { id, x: 0, finished: false };
        }
      }
    } else if (mode === 'DISTRIBUTION') {
      state.tick = 500;
      // Force finish all racers
      Object.keys(state.racers).forEach((id) => {
        state.racers[id].finished = true;
        state.racers[id].x = 1100; // Past finish line
      });
    }

    // Save and Sync
    this.saveSimulationState(state);

    // Force immediate sync
    this.handleMessage({
      type: 'SYNC_STATE',
      state: {
        mode: state.mode,
        tick: state.tick,
        racers: state.racers,
        startTime: state.startTime,
      },
    });

    // Reset timer accumulators to avoid jumps
    this.lastTickTime = Date.now();
    this.pendingTicks = 0;
  }

  private loadSimulationState() {
    try {
      const saved = localStorage.getItem('game_simulation_state');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  private saveSimulationState(state: any) {
    try {
      localStorage.setItem(
        'game_simulation_state',
        JSON.stringify({
          ...state,
          timestamp: Date.now(),
        }),
      );
    } catch (e) {
      // Ignore storage errors
    }
  }

  private startSimulation() {
    if (this.simulationInterval) return;

    this.isSimulationMode = true;
    this.lastTickTime = Date.now();
    this.pendingTicks = 0;

    // Default Initial State
    let tick = 0;
    let mode: GameMode = 'PREPARATION';
    let racers: Record<string, RacerState> = {};
    let startTime = Date.now() + 5000;

    // Initialize racers
    for (let i = 0; i < 10; i++) {
      const id = `racer_${i}`;
      racers[id] = { id, x: 0, finished: false };
    }

    // Try to load saved state
    const saved = this.loadSimulationState();
    if (saved) {
      const now = Date.now();
      const elapsed = now - saved.timestamp;
      // If saved less than 24 hours ago, try to restore
      if (elapsed < 24 * 60 * 60 * 1000) {
        tick = saved.tick;
        mode = saved.mode;
        racers = saved.racers;
        startTime = saved.startTime;

        // Fast forward logic moved to the loop below
        // We just update the lastTickTime to account for the elapsed time
        this.lastTickTime = now - elapsed;
      }
    }

    // Sync initial/restored state
    this.handleMessage({
      type: 'SYNC_STATE',
      state: {
        mode,
        tick,
        racers,
        startTime,
      },
    });

    // Expose to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).gameSocket = this;
    }

    this.simulationInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - this.lastTickTime;
      this.lastTickTime = now;
      this.pendingTicks += delta;

      // Protection against huge jumps (max 1 minute catch-up)
      if (this.pendingTicks > 60000) {
        this.pendingTicks = 60000;
      }

      let ticksProcessed = 0;
      let stateChanged = false;

      // Process all pending ticks
      while (this.pendingTicks >= this.TICK_RATE) {
        const result = this.processSimulationTick(tick, mode, racers, startTime);

        // Update local variables
        tick = result.tick;
        mode = result.mode;
        racers = result.racers;
        startTime = result.startTime;

        // Only broadcast updates for the LAST tick in the batch to save bandwidth/performance
        // OR broadcast important mode changes immediately
        if (result.modeChanged) {
          this.handleMessage({ type: 'MODE_CHANGE', mode });
          if (mode === 'PREPARATION') {
            this.handleMessage({ type: 'SYNC_STATE', state: { mode, tick, racers, startTime } });
          }
        }

        this.pendingTicks -= this.TICK_RATE;
        ticksProcessed++;
        stateChanged = true;
      }

      // If we processed any ticks, send the final state update
      if (ticksProcessed > 0) {
        // Send TICK update for smooth interpolation
        // We only send the latest state, clients should interpolate to it
        // Since we might have processed 20 ticks in one go, the client will see a jump
        // This is expected behavior for "catching up"
        const updates: Record<string, Partial<RacerState>> = {};
        Object.keys(racers).forEach((id) => {
          updates[id] = { x: racers[id].x, finished: racers[id].finished };
        });
        this.handleMessage({ type: 'TICK', tick, racers: updates });

        // Save state
        this.saveSimulationState({ tick, mode, racers, startTime });
      }
    }, 50); // Try to run every 50ms, but robust to throttling
  }

  private processSimulationTick(
    tick: number,
    mode: GameMode,
    racers: Record<string, RacerState>,
    startTime: number,
  ): {
    tick: number;
    mode: GameMode;
    racers: Record<string, RacerState>;
    startTime: number;
    modeChanged: boolean;
    updates?: Record<string, Partial<RacerState>>;
  } {
    let nextTick = tick + 1;
    let nextMode = mode;
    let nextStartTime = startTime;
    let modeChanged = false;
    const updates: Record<string, Partial<RacerState>> = {};

    // Simple State Machine
    if (nextTick === 100) {
      nextMode = 'RACE';
      modeChanged = true;
    } else if (nextTick > 100 && nextTick < 500) {
      // Move racers
      Object.keys(racers).forEach((id) => {
        // Random speed (deterministic for simulation stability ideally, but random is fine for now)
        const speed = Math.random() * 5 + 2;
        racers[id].x += speed;
        if (racers[id].x > 1000 && !racers[id].finished) {
          racers[id].finished = true;
        }
        updates[id] = { x: racers[id].x, finished: racers[id].finished };
      });

      // Check for finish
      if (Object.values(racers).every((r) => r.finished)) {
        nextTick = 499; // Force end to trigger DISTRIBUTION at tick 500
      }
    } else if (nextTick === 500) {
      nextMode = 'DISTRIBUTION';
      modeChanged = true;
    } else if (nextTick === 600) {
      // Reset
      nextTick = 0;
      nextMode = 'PREPARATION';
      modeChanged = true;
      nextStartTime = Date.now() + 5000; // Reset timer for next round

      Object.keys(racers).forEach((id) => {
        racers[id].x = 0;
        racers[id].finished = false;
      });
    }

    return {
      tick: nextTick,
      mode: nextMode,
      racers,
      startTime: nextStartTime,
      modeChanged,
      updates,
    };
  }

  private stopSimulation() {
    this.isSimulationMode = false;
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const gameSocket = new GameSocket();
