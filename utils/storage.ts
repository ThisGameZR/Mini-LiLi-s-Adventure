import { PlayerProgress } from '../types';
import { INITIAL_PROGRESS } from '../constants';

const STORAGE_KEY = 'minilili_adventure_save_v1';

export const saveProgress = (progress: PlayerProgress): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress', e);
  }
};

export const loadProgress = (): PlayerProgress => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Merge with initial to ensure new levels exist if we update the game
      return {
        ...INITIAL_PROGRESS,
        ...parsed,
        levels: { ...INITIAL_PROGRESS.levels, ...parsed.levels }
      };
    }
  } catch (e) {
    console.warn('Failed to load progress', e);
  }
  return INITIAL_PROGRESS;
};
