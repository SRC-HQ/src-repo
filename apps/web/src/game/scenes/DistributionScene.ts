import { Container } from 'pixi.js';
import { Scene } from '../core/Scene';

/**
 * Minimal distribution phase scene. The actual leaderboard is rendered
 * by DistributionLeaderboard (React + SpmSwimSprite) overlay.
 */
export class DistributionScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  update() {
    // No update logic needed
  }

  destroy() {
    try {
      if (this.container && !this.container.destroyed) {
        this.container.destroy({ children: true });
      }
    } catch {
      /* already destroyed */
    }
  }
}
