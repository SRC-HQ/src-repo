import { Application, Ticker } from 'pixi.js';
import { SceneManager } from './SceneManager';

export class GameLoop {
  private app: Application;
  private sceneManager: SceneManager;

  constructor(app: Application, sceneManager: SceneManager) {
    this.app = app;
    this.sceneManager = sceneManager;
  }

  start() {
    // @ts-ignore - PixiJS v8 ticker add signature
    this.app.ticker?.add(this.update, this);
  }

  stop() {
    // @ts-ignore - PixiJS v8 ticker remove signature
    this.app.ticker?.remove(this.update, this);
  }

  private update(ticker: Ticker) {
    // PixiJS v8 passes ticker object
    this.sceneManager.update(ticker.deltaTime);
  }
}
