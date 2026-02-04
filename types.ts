export enum Scene {
  MENU = 'MENU',
  HUB = 'HUB',
  GAME_CATCH = 'GAME_CATCH',
  GAME_MAZE = 'GAME_MAZE',
  GAME_DUCK_KINGDOM = 'GAME_DUCK_KINGDOM',
}

export interface LevelStats {
  unlocked: boolean;
  highScore: number;
  stars: number; // 0-3
}

export interface PlayerProgress {
  tutorial: boolean;
  currency: number; // BreadCrumbs
  levels: {
    [key in Scene]?: LevelStats;
  };
}

export interface GameContextProps {
  progress: PlayerProgress;
  currentScene: Scene;
  unlockLevel: (scene: Scene, score: number, stars: number) => void;
  changeScene: (scene: Scene) => void;
  playSfx: (type: 'honk' | 'step' | 'win' | 'fail') => void;
}

export interface CursorState {
  x: number;
  y: number;
  isClicking: boolean;
  isMoving: boolean;
  direction: 'left' | 'right';
}