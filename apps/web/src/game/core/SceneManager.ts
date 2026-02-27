import { Application, Container } from 'pixi.js';
import { GameMode } from '../types/GameState';
import { PreparationScene } from '../scenes/PreparationScene';
import { RaceScene } from '../scenes/RaceScene';
import { DistributionScene } from '../scenes/DistributionScene';
import { useGameStore } from '../../store/gameStore';
import { Scene } from './Scene';

export class SceneManager {
  private app: Application;
  private currentScene: Scene | null = null;
  private currentMode: GameMode | null = null;
  private sceneContainer: Container;
  private unsubscribe: () => void;

  constructor(app: Application) {
    this.app = app;
    this.sceneContainer = new Container();
    this.app.stage.addChild(this.sceneContainer);

    // Subscribe to mode changes
    this.unsubscribe = useGameStore.subscribe((state) => {
      if (state.mode !== this.currentMode) {
        this.switchScene(state.mode);
      }
    });

    // Initial scene
    const initialMode = useGameStore.getState().mode;
    this.switchScene(initialMode);
  }

  destroy() {
    this.unsubscribe();
    if (this.currentScene) {
      this.currentScene.destroy();
      this.currentScene = null;
    }

    if (!this.sceneContainer.destroyed) {
      this.sceneContainer.destroy({ children: true });
    }
  }

  switchScene(mode: GameMode) {
    if (this.currentScene) {
      const oldContainer = this.currentScene.container;
      this.currentScene.destroy();
      try {
        if (oldContainer && !oldContainer.destroyed && oldContainer.parent === this.sceneContainer) {
          this.sceneContainer.removeChild(oldContainer);
        }
      } catch (_) { /* already removed */ }
      this.currentScene = null;
    }

    this.currentMode = mode;

    switch (mode) {
      case 'PREPARATION':
        this.currentScene = new PreparationScene();
        break;
      case 'RACE':
        this.currentScene = new RaceScene();
        break;
      case 'DISTRIBUTION':
        this.currentScene = new DistributionScene();
        break;
    }

    if (this.currentScene) {
      this.sceneContainer.addChild(this.currentScene.container);
    }
  }

  update(delta: number) {
    if (this.currentScene) {
      this.currentScene.update(delta);
    }
  }
}
