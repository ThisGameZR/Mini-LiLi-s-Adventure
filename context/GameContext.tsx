import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlayerProgress, Scene, GameContextProps } from '../types';
import { INITIAL_PROGRESS } from '../constants';
import { saveProgress, loadProgress } from '../utils/storage';
import { playHonk } from '../utils/audio';

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<PlayerProgress>(INITIAL_PROGRESS);
  const [currentScene, setCurrentScene] = useState<Scene>(Scene.MENU);

  useEffect(() => {
    const loaded = loadProgress();
    setProgress(loaded);
  }, []);

  const unlockLevel = (scene: Scene, score: number, stars: number) => {
    setProgress((prev) => {
      const newProgress = {
        ...prev,
        currency: prev.currency + score,
        levels: {
          ...prev.levels,
          [scene]: { 
              unlocked: true, 
              highScore: Math.max(score, prev.levels[scene]?.highScore || 0), 
              stars: Math.max(stars, prev.levels[scene]?.stars || 0) 
          }
        }
      };
      saveProgress(newProgress);
      return newProgress;
    });
  };

  const changeScene = (scene: Scene) => {
    setCurrentScene(scene);
  };

  const playSfx = (type: 'honk' | 'step' | 'win' | 'fail') => {
    if (type === 'honk') playHonk();
  };

  return (
    <GameContext.Provider value={{ progress, currentScene, unlockLevel, changeScene, playSfx }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within a GameProvider");
  return context;
};
