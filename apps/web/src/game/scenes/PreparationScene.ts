import { Container, Graphics, Text, Sprite } from 'pixi.js';
import { Scene } from '../core/Scene';

const RACER_COUNT = 10;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X = 60;
const FINISH_X = 1100;

/**
 * Renders the track for the preparation phase. Racers are rendered by
 * PreparationOverlay (React + SpmSwimSprite) for consistency with Select Your Racer.
 */
export class PreparationScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  update(_delta: number) {}

  destroy() {
    try {
      if (this.container && !this.container.destroyed) {
        this.container.destroy({ children: true });
      }
    } catch (_) {
      /* already destroyed */
    }
  }
}
