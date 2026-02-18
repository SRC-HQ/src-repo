import { Container, Graphics, Text, Sprite } from 'pixi.js';
import { Scene } from '../core/Scene';
import { RACER_COLORS, GAME_WIDTH, GAME_HEIGHT } from '../constants';

const RACER_COUNT = 10;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X = 60;

export class PreparationScene implements Scene {
  container: Container;
  private racerGfxList: Container[] = [];

  constructor() {
    this.container = new Container();

    const text = new Text('BETTING PHASE — PLACE YOUR BETS', { 
      fill: 0xffffff,
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Orbitron'
    });
    text.anchor.set(0.5);
    text.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
    this.container.addChild(text);

    // Show racers idle at start line
    for (let i = 0; i < RACER_COUNT; i++) {
      const color = RACER_COLORS[i % RACER_COLORS.length];
      const gfx = this.createRacerGfx(i, color);
      gfx.x = START_X;
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
    const label = new Text({ text: `#${index + 1}`, style: { fontSize: 11, fill: 0xffffff, fontFamily: 'Orbitron' } });
    label.position.set(-10, -28);
    c.addChild(label);
    return c;
  }

  update(delta: number) {
    // Gentle idle wobble while waiting
    for (let i = 0; i < this.racerGfxList.length; i++) {
      const gfx = this.racerGfxList[i];
      gfx.children[0].y = Math.sin(Date.now() / 200 + i * 0.8) * 1.5;
    }
  }

  destroy() {
    this.container.destroy({ children: true });
    this.racerGfxList = [];
  }
}
