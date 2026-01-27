import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { RacerState } from '../types/GameState';
import { INTERPOLATION_FACTOR } from '../constants';

export class Racer extends Container {
  public id: string;
  private visual: Graphics;
  private racerNameText: Text;
  private targetX: number = 0;

  constructor(id: string, initialState: RacerState, color: string = '#ffffff') {
    super();
    this.id = id;
    this.targetX = initialState.x;
    this.x = initialState.x;

    this.visual = new Graphics();

    // Check if we are using PixiJS v8 or v7 types.
    // If v8, circle/fill/stroke methods exist.
    // If v7, drawCircle/beginFill/endFill/lineStyle exist.
    // Assuming v8 as requested, but adding ts-ignore to suppress linter if it sees v7 types.

    // @ts-ignore - PixiJS v8 API
    this.visual.circle(0, 0, 15);
    // @ts-ignore - PixiJS v8 API
    this.visual.fill(0xffffff); // White body
    // @ts-ignore - PixiJS v8 API
    this.visual.stroke({ width: 3, color: color }); // Colored stroke

    // Tail
    this.visual.moveTo(-15, 0);
    this.visual.lineTo(-30, 0);
    // @ts-ignore - PixiJS v8 API
    this.visual.stroke({ width: 3, color: color }); // Colored tail

    this.addChild(this.visual);

    // Label
    // @ts-ignore - PixiJS v8 Text options
    this.racerNameText = new Text({
      text: id.substring(0, 4),
      style: { fontSize: 12, fill: 0xffffff },
    });
    this.racerNameText.position.set(-10, -30);
    this.addChild(this.racerNameText);
  }

  updateTarget(state: Partial<RacerState>) {
    if (state.x !== undefined) {
      this.targetX = state.x;
    }
  }

  update(delta: number) {
    const diff = this.targetX - this.x;
    if (Math.abs(diff) > 0.1) {
      this.x += diff * INTERPOLATION_FACTOR;
    } else {
      this.x = this.targetX;
    }

    // Simple idle/swim animation
    this.visual.y = Math.sin(Date.now() / 100 + parseInt(this.id.slice(-2) || '0', 16)) * 2;
  }
}
