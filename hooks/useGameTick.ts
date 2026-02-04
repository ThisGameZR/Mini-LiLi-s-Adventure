import { useEffect } from 'react';
import { GameMode, GameState } from '../types';
import { TICK_RATE, STAT_DECAY } from '../config/gameConfig';

interface UseGameTickProps {
  mode: GameMode;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const useGameTick = ({ mode, gameState, setGameState }: UseGameTickProps) => {
  useEffect(() => {
    if (mode !== GameMode.HOME) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        // Poop Logic: If well fed (>50) and no poop, 10% chance
        const shouldPoop = !prev.hasPoop && prev.stats.tummy > 50 && Math.random() < 0.1;
        
        // Decay logic
        const newStats = { ...prev.stats };
        newStats.tummy = Math.max(0, newStats.tummy - STAT_DECAY);
        
        // Joy drops much faster if poop is present
        const joyDecay = (prev.hasPoop || shouldPoop) ? 5 : 1;
        newStats.joy = Math.max(0, newStats.joy - joyDecay);
        
        newStats.energy = Math.max(0, newStats.energy - 0.5);

        return { 
          ...prev, 
          stats: newStats,
          hasPoop: prev.hasPoop || shouldPoop
        };
      });
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [mode, setGameState]);
};
