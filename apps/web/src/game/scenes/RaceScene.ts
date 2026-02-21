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

    const headerText = new Text('RACE STARTED', { fill: 0xffffff, fontSize: 20 });
    headerText.position.set(50, 20);
    this.container.addChild(headerText);

    const trackGfx = new Graphics();
    for (let i = 0; i <= RACER_COUNT; i++) {
      const y = START_Y + i * LANE_HEIGHT;
      trackGfx.moveTo(START_X, y);
      trackGfx.lineTo(FINISH_X, y);
    }
    trackGfx.stroke({ width: 1, color: 0xffffff, alpha: 0.2 });
    this.container.addChild(trackGfx);

    const startLine = new Graphics();
    startLine.moveTo(START_X, START_Y);
    startLine.lineTo(START_X, START_Y + RACER_COUNT * LANE_HEIGHT);
    startLine.stroke({ width: 2, color: 0x33ff57 });
    this.container.addChild(startLine);

    const finishLine = new Graphics();
    finishLine.moveTo(FINISH_X, START_Y);
    finishLine.lineTo(FINISH_X, START_Y + RACER_COUNT * LANE_HEIGHT);
    finishLine.stroke({ width: 2, color: 0xff5733 });
    this.container.addChild(finishLine);
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
    } catch (_) { /* already destroyed */ }
  }
}
