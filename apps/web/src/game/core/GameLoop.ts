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
    this.app.ticker?.add(this.update, this);
  }

  stop() {
    this.app.ticker?.remove(this.update, this);
  }

  private update(ticker: Ticker) {
    // PixiJS v8 passes ticker object
    this.sceneManager.update(ticker.deltaTime);
  }
}
