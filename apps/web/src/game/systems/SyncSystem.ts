import { Container } from 'pixi.js';
import { useGameStore } from '../../store/gameStore';
import { Racer } from '../entities/Racer';
import { RacerState } from '../types/GameState';

export class SyncSystem {
  private container: Container;
  private racers: Map<string, Racer>;

  constructor(container: Container, racers: Map<string, Racer>) {
    this.container = container;
    this.racers = racers;
  }

  update() {
    const state = useGameStore.getState();
    const serverRacers = state.racers;

    // Create new racers
    Object.values(serverRacers).forEach((racerState) => {
      if (!this.racers.has(racerState.id)) {
        this.createRacer(racerState);
      }
    });

    // Update existing racers
    this.racers.forEach((racer, id) => {
      if (serverRacers[id]) {
        racer.updateTarget(serverRacers[id]);
      } else {
        // Racer removed?
        this.removeRacer(id);
      }
    });
  }

  private createRacer(state: RacerState) {
    // Simple layout calculation
    const count = this.racers.size;
    const laneHeight = 50;
    const startY = 100;

    const racer = new Racer(state.id, state);

    // Try to derive a stable index/lane from ID or just append
    // For now append
    racer.y = startY + (count % 10) * laneHeight;

    this.container.addChild(racer);
    this.racers.set(state.id, racer);
  }

  private removeRacer(id: string) {
    const racer = this.racers.get(id);
    if (racer) {
      this.container.removeChild(racer);
      racer.destroy();
      this.racers.delete(id);
    }
  }
}
