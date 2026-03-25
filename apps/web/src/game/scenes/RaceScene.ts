import { Container } from 'pixi.js';
import { Scene } from '../core/Scene';
import { useGameStore } from '../../store/gameStore';

/**
 * Renders the race track (lanes, start/finish). Racers are rendered by
 * RaceOverlay (React + SpmSwimSprite) for consistency with Select Your Racer.
 */
export class RaceScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  update() {
    const { pendingPhaseEvent, applyPendingPhaseEvent, apiPhaseStartedAt, apiPhaseEndsAt } =
      useGameStore.getState();

    if (!pendingPhaseEvent) return;

    const duration = apiPhaseEndsAt - apiPhaseStartedAt;
    if (duration <= 0) return;

    const elapsed = Date.now() - apiPhaseStartedAt;
    if (elapsed < duration) return;

    applyPendingPhaseEvent();
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
