import { Container, Graphics, Text } from 'pixi.js';
import { Scene } from '../core/Scene';
import { useGameStore } from '../../store/gameStore';
import { RACER_COLORS } from '../constants';

const RACER_COUNT = 10;
const LANE_HEIGHT = 50;
const START_Y = 80;
const START_X = 60;
/** X position that counts as the finish line */
const FINISH_X = 1100;

interface LocalRacer {
  gfx: Container;
  /** Normalized speed multiplier (0.7 – 1.0), randomised per racer */
  speed: number;
  /** Current x progress */
  x: number;
  finished: boolean;
}

export class RaceScene implements Scene {
  container: Container;
  private racers: LocalRacer[] = [];
  private headerText: Text;
  private raceStarted = false;

  constructor() {
    this.container = new Container();

    this.headerText = new Text('RACE STARTED', { fill: 0xffffff, fontSize: 20, fontFamily: 'Orbitron' });
    this.headerText.position.set(50, 20);
    this.container.addChild(this.headerText);

    // Create visual racers
    for (let i = 0; i < RACER_COUNT; i++) {
      const color = RACER_COLORS[i % RACER_COLORS.length];
      const gfx = this.createRacerGfx(i, color);
      gfx.x = START_X;
      gfx.y = START_Y + i * LANE_HEIGHT;
      this.container.addChild(gfx);

      this.racers.push({
        gfx,
        speed: 0.7 + Math.random() * 0.3, // variation
        x: START_X,
        finished: false,
      });
    }

    this.raceStarted = true;
  }

  private createRacerGfx(index: number, color: string): Container {
    const c = new Container();

    const body = new Graphics();
    // @ts-ignore - PixiJS v8 API
    body.circle(0, 0, 15);
    // @ts-ignore
    body.fill(0xffffff);
    // @ts-ignore
    body.stroke({ width: 3, color });

    // Tail
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
    if (!this.raceStarted) return;

    const { apiPhaseStartedAt, apiPhaseEndsAt } = useGameStore.getState();
    const duration = apiPhaseEndsAt - apiPhaseStartedAt;

    if (duration <= 0) {
      // Fallback: animate at constant speed when no API timing
      this.animateFallback(delta);
      return;
    }

    // Progress 0 → 1 based on elapsed time within the phase
    const elapsed = Date.now() - apiPhaseStartedAt;
    const baseProgress = Math.min(1, Math.max(0, elapsed / duration));

    for (const racer of this.racers) {
      if (racer.finished) continue;

      // Each racer's effective progress = baseProgress * its speed factor
      // Fastest racer (speed=1.0) reaches finish at progress=1.0
      // Slowest racer (speed=0.7) reaches finish at progress=1.0/0.7 ≈ 1.43 (clamped)
      const racerProgress = Math.min(1, baseProgress * racer.speed / this.getMaxSpeed());
      const targetX = START_X + (FINISH_X - START_X) * racerProgress;

      // Smooth interpolation toward target
      racer.x += (targetX - racer.x) * 0.1;
      racer.gfx.x = racer.x;

      if (racerProgress >= 1) {
        racer.finished = true;
        racer.gfx.x = FINISH_X;
        racer.x = FINISH_X;
      }

      // Swim wobble
      racer.gfx.children[0].y = Math.sin(Date.now() / 100 + racer.speed * 100) * 2;
    }
  }

  /** Largest speed value among racers — the leader finishes exactly at phase end */
  private maxSpeed: number | null = null;
  private getMaxSpeed(): number {
    if (!this.maxSpeed) {
      this.maxSpeed = Math.max(...this.racers.map((r) => r.speed));
    }
    return this.maxSpeed;
  }

  /** Fallback when no API timing (simulation / dev) */
  private animateFallback(delta: number) {
    for (const racer of this.racers) {
      if (racer.finished) continue;
      racer.x += racer.speed * delta * 2;
      racer.gfx.x = racer.x;
      if (racer.x >= FINISH_X) {
        racer.finished = true;
        racer.gfx.x = FINISH_X;
      }
      racer.gfx.children[0].y = Math.sin(Date.now() / 100 + racer.speed * 100) * 2;
    }
  }

  destroy() {
    this.container.destroy({ children: true });
    this.racers = [];
  }
}
