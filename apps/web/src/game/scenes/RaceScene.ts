import { Container, Graphics, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import { useGameStore } from '../../store/gameStore';

const RACER_COUNT = 10;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X = 60;
const FINISH_X = 1100;

/**
 * Renders the race track (lanes, start/finish). Racers are rendered by
 * RaceOverlay (React + SpmSwimSprite) for consistency with Select Your Racer.
 */
export class RaceScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();
  }

  update(_delta: number) {
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
    } catch (_) {
      /* already destroyed */
    }
  }
}
