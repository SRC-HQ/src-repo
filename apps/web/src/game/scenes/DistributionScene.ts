import { Container, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import { SyncSystem } from '../systems/SyncSystem';
import { Racer } from '../entities/Racer';
import { useGameStore } from '../../store/gameStore';

export class DistributionScene implements Scene {
  container: Container;
  private racers: Map<string, Racer> = new Map();
  private syncSystem: SyncSystem;
  private winnerText: Text;
  private phaseText: Text;

  constructor() {
    this.container = new Container();

    this.phaseText = new Text('DISTRIBUTION PHASE', { fill: 0xffffff, fontSize: 24 });
    this.phaseText.position.set(50, 50);
    this.container.addChild(this.phaseText);

    this.winnerText = new Text('WINNER: ...', { fill: 0xffd700, fontSize: 36 });
    this.winnerText.position.set(400, 150);
    this.container.addChild(this.winnerText);

    this.syncSystem = new SyncSystem(this.container, this.racers);
  }

  update(delta: number) {
    this.syncSystem.update();
    this.racers.forEach((racer) => racer.update(delta));

    // Highlight winner
    const racers = useGameStore.getState().racers;
    const winner = Object.values(racers).find((r) => r.finished);
    if (winner) {
      this.winnerText.text = `WINNER: ${winner.id}`;
    }
  }

  destroy() {
    this.container.destroy({ children: true });
    this.racers.clear();
  }
}
