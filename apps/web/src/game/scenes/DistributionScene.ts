import { Container, Text } from "pixi.js";
import { Scene } from "../core/Scene";

/**
 * Minimal distribution phase scene. The actual leaderboard is rendered
 * by DistributionLeaderboard (React + SpmSwimSprite) overlay.
 */
export class DistributionScene implements Scene {
  container: Container;

  constructor() {
    this.container = new Container();

    const phaseText = new Text({
      text: "RESULTS — DISTRIBUTING WINNINGS",
      style: {
        fill: 0xffffff,
        fontSize: 20,
        fontFamily: "Orbitron",
      },
    });
    phaseText.position.set(50, 20);
    this.container.addChild(phaseText);
  }

  update() {
    // No update logic needed
  }

  destroy() {
    try {
      if (this.container && !this.container.destroyed) {
        this.container.destroy({ children: true });
      }
    } catch {
      /* already destroyed */
    }
  }
}
