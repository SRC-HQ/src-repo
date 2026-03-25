import { Container } from 'pixi.js';
import { Scene } from '../core/Scene';

/**
 * Renders the track for the preparation phase. Racers are rendered by
 * PreparationOverlay (React + SpmSwimSprite) for consistency with Select Your Racer.
 */
export class PreparationScene implements Scene {
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
