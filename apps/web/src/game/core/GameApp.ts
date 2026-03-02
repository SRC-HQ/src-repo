import { Application } from 'pixi.js';
import { GAME_WIDTH, GAME_HEIGHT, PORTRAIT_WIDTH, PORTRAIT_HEIGHT } from '../constants';
import { SceneManager } from './SceneManager';
import { GameLoop } from './GameLoop';

export class GameApp {
  public app: Application;
  public sceneManager!: SceneManager;
  public gameLoop!: GameLoop;
  private isDestroyed: boolean = false;
  private isInitializing: boolean = false;
  private element: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    this.app = new Application();
    // SceneManager and GameLoop will be initialized in init()
    // to ensure PixiJS app is fully initialized first
  }

  async init(element: HTMLElement) {
    if (this.isDestroyed) return;

    this.element = element;
    this.isInitializing = true;

    try {
      // Determine initial dimensions based on viewport
      const isLandscape = window.innerWidth > window.innerHeight;
      const width = isLandscape ? GAME_WIDTH : PORTRAIT_WIDTH;
      const height = isLandscape ? GAME_HEIGHT : PORTRAIT_HEIGHT;

      // PixiJS v8 requires async init
      await (this.app as any).init({
        width,
        height,
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

      // Setup responsive resize
      this.setupResize();

      this.gameLoop.start();
    } catch (error) {
      console.error('GameApp init error:', error);
    }
  }

  private setupResize() {
    if (!this.element) return;

    const resize = () => {
      if (!this.element || this.isDestroyed) return;

      const containerWidth = this.element.clientWidth;
      const containerHeight = this.element.clientHeight;
      const isLandscape = containerWidth > containerHeight;

      // Set canvas dimensions based on orientation
      const canvasWidth = isLandscape ? GAME_WIDTH : PORTRAIT_WIDTH;
      const canvasHeight = isLandscape ? GAME_HEIGHT : PORTRAIT_HEIGHT;

      // Calculate scale to fit container while maintaining aspect ratio
      const scaleX = containerWidth / canvasWidth;
      const scaleY = containerHeight / canvasHeight;
      const scale = Math.min(scaleX, scaleY);

      // Apply dimensions to renderer
      const renderer = (this.app as any).renderer;
      if (renderer) {
        renderer.resize(canvasWidth, canvasHeight);
      }

      // Apply CSS scaling
      const canvas = (this.app as any).canvas;
      if (canvas) {
        const scaledWidth = canvasWidth * scale;
        const scaledHeight = canvasHeight * scale;

        canvas.style.width = `${scaledWidth}px`;
        canvas.style.height = `${scaledHeight}px`;

        // Center the canvas
        const offsetX = (containerWidth - scaledWidth) / 2;
        const offsetY = (containerHeight - scaledHeight) / 2;

        canvas.style.position = 'absolute';
        canvas.style.left = `${offsetX}px`;
        canvas.style.top = `${offsetY}px`;
      }
    };

    // Initial resize
    resize();

    // Watch for container size changes
    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(this.element);

    // Also listen to window resize for orientation changes
    window.addEventListener('resize', resize);
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.cleanup();
  }

  private cleanup() {
    try {
      if (this.isInitializing) return;

      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

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

      this.element = null;
    } catch (e) {
      console.warn('Error during GameApp cleanup:', e);
    }
  }
}
