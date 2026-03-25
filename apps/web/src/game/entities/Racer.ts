import { Container } from 'pixi.js';
import { RacerState } from '../types/GameState';

export class Racer extends Container {
  public id: string;
  private targetX: number = 0;

  constructor(id: string, initialState: RacerState) {
    super();
    this.id = id;
    this.targetX = initialState.x;
    this.x = initialState.x;
  }

  updateTarget(state: Partial<RacerState>) {
    if (state.x !== undefined) {
      this.targetX = state.x;
    }
  }

  update() {
    // Simple update logic
  }
}
