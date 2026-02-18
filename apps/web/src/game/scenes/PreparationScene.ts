import { Container, Graphics, Text } from 'pixi.js';
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

    const text = new Text('PREPARATION PHASE — CHOOSE YOUR SPERM', {
      fill: 0xffffff,
      fontSize: 20,
    });
    text.position.set(50, 20);
    this.container.addChild(text);

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

  update(_delta: number) {}

  destroy() {
    this.container.destroy({ children: true });
  }
}
