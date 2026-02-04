import { Scene } from './types';

export const COLORS = {
  sky: 'bg-[#87CEEB]',
  grass: 'bg-[#90EE90]',
  gooseWhite: 'bg-white',
  gooseOrange: 'bg-orange-400',
  uiPrimary: 'bg-white',
  uiText: 'text-slate-700'
};

export const INITIAL_PROGRESS = {
  tutorial: false,
  currency: 0,
  levels: {
    [Scene.GAME_CATCH]: { unlocked: true, highScore: 0, stars: 0 },
    [Scene.GAME_MAZE]: { unlocked: false, highScore: 0, stars: 0 },
    [Scene.GAME_DUCK_KINGDOM]: { unlocked: false, highScore: 0, stars: 0 },
  }
};

export const CURSOR_LAG = 0.15; // 0 to 1, lower is smoother/heavier