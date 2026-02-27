import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';
import { SceneManager } from './SceneManager';
import { GameLoop } from './GameLoop';

export class GameApp {
  public app: Application;
  public sceneManager!: SceneManager;
  public gameLoop!: GameLoop;
  private isDestroyed: boolean = false;
  private isInitializing: boolean = false;

  constructor() {
    this.app = new Application();
    // SceneManager and GameLoop will be initialized in init()
    // to ensure PixiJS app is fully initialized first
  }

  async init(element: HTMLElement) {
    if (this.isDestroyed) return;

    this.isInitializing = true;
    try {
      // PixiJS v8 requires async init and has different properties than v7
      // Casting to any to avoid TypeScript errors if v7 types are present in node_modules
      await (this.app as any).init({
        // width: GAME_WIDTH, // Removed in favor of resizeTo
        // height: GAME_HEIGHT,
        resizeTo: element,
        backgroundColor: 0x5b5880,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        antialias: true,
      });

      this.isInitializing = false;

      if (this.isDestroyed) {
        // If destroyed during init, clean up immediately
        this.cleanup();
        return;
      }

      // Initialize scene manager and game loop after app is ready
      this.sceneManager = new SceneManager(this.app);
      this.gameLoop = new GameLoop(this.app, this.sceneManager);

      // In v8, canvas is available after init
      element.appendChild((this.app as any).canvas);

      this.gameLoop.start();
    } catch (error) {
      console.error('GameApp init error:', error);
    }
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.cleanup();
  }

  private cleanup() {
    try {
      if (this.isInitializing) return;

      if (this.gameLoop) {
        this.gameLoop.stop();
      }

      if (this.sceneManager) {
        this.sceneManager.destroy();
      }

      // v8 destroy signature
      // Explicit null check for app
      if (this.app) {
        this.app.destroy(true, { children: true, texture: true, textureSource: true } as any);
      }
    } catch (e) {
      console.warn('Error during GameApp cleanup:', e);
    }
  }
}
