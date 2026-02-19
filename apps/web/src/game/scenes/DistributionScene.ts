import { Container, Text } from 'pixi.js';
import { Scene } from '../core/Scene';

/**
 * Minimal distribution phase scene. The actual leaderboard is rendered
 * by DistributionLeaderboard (React + SpmSwimSprite) overlay.
 */
export class DistributionScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();

    const phaseText = new Text('RESULTS — DISTRIBUTING WINNINGS', {
      fill: 0xffffff,
      fontSize: 20,
      fontFamily: 'Orbitron',
    });
    phaseText.position.set(50, 20);
    this.container.addChild(phaseText);
  }

  update(_delta: number) {}

  destroy() {
    this.container.destroy({ children: true });
  }
}
