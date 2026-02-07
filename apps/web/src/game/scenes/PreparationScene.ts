import { Container, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import { SyncSystem } from '../systems/SyncSystem';
import { Racer } from '../entities/Racer';

export class PreparationScene implements Scene {
  container: Container;
  private racers: Map<string, Racer> = new Map();
  private syncSystem: SyncSystem;

  constructor() {
    this.container = new Container();
    const text = new Text('PREPARATION - WAITING', { fill: 0xffffff });
    text.position.set(50, 50);
    this.container.addChild(text);

    this.syncSystem = new SyncSystem(this.container, this.racers);
  }

  update(delta: number) {
    this.syncSystem.update();
    this.racers.forEach((racer) => racer.update(delta));
  }

  destroy() {
    this.container.destroy({ children: true });
    this.racers.clear();
  }
}
