import { Container, Graphics, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import { RACER_COLORS } from '../constants';

const RACER_COUNT = 10;
const LANE_HEIGHT = 50;
const START_Y = 80;
const FINISH_X = 1100;

export class DistributionScene implements Scene {
  container: Container;
  private racerGfxList: Container[] = [];

  constructor() {
    this.container = new Container();

    const phaseText = new Text('RESULTS — DISTRIBUTING WINNINGS', {
      fill: 0xffffff,
      fontSize: 20,
    });
    phaseText.position.set(50, 20);
    this.container.addChild(phaseText);

    // Show all racers at the finish line
    for (let i = 0; i < RACER_COUNT; i++) {
      const color = RACER_COLORS[i % RACER_COLORS.length];
      const gfx = this.createRacerGfx(i, color);
      gfx.x = FINISH_X;
      gfx.y = START_Y + i * LANE_HEIGHT;
      this.container.addChild(gfx);
      this.racerGfxList.push(gfx);
    }
  }

  private createRacerGfx(index: number, color: string): Container {
    const c = new Container();
    const body = new Graphics();
    // @ts-ignore
    body.circle(0, 0, 15);
    // @ts-ignore
    body.fill(0xffffff);
    // @ts-ignore
    body.stroke({ width: 3, color });
    body.moveTo(-15, 0);
    body.lineTo(-30, 0);
    // @ts-ignore
    body.stroke({ width: 3, color });
    c.addChild(body);
    // @ts-ignore
    const label = new Text({ text: `#${index + 1}`, style: { fontSize: 11, fill: 0xffffff } });
    label.position.set(-10, -28);
    c.addChild(label);
    return c;
  }

  update(_delta: number) {
    // Gentle idle at finish line
    for (let i = 0; i < this.racerGfxList.length; i++) {
      const gfx = this.racerGfxList[i];
      gfx.children[0].y = Math.sin(Date.now() / 300 + i) * 1;
    }
  }

  destroy() {
    this.container.destroy({ children: true });
    this.racerGfxList = [];
  }
}
