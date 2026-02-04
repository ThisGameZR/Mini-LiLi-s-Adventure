import { useState, useEffect, useCallback } from 'react';
import { GameState, Stats, ItemId } from '../types';
import { INITIAL_STATE, MAX_STAT } from '../config/gameConfig';

const SAVE_KEY = 'lili_save_v1';

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? { ...INITIAL_STATE, ...JSON.parse(saved) } : INITIAL_STATE;
  });

  // Save game on state change
  useEffect(() => {
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const updateStats = useCallback((delta: Partial<Stats>) => {
    setGameState(prev => {
      const newStats = { ...prev.stats };
      if (delta.tummy !== undefined) {
        newStats.tummy = Math.min(MAX_STAT, Math.max(0, newStats.tummy + delta.tummy));
      }
      if (delta.joy !== undefined) {
        newStats.joy = Math.min(MAX_STAT, Math.max(0, newStats.joy + delta.joy));
      }
      if (delta.energy !== undefined) {
        newStats.energy = Math.min(MAX_STAT, Math.max(0, newStats.energy + delta.energy));
      }
      return { ...prev, stats: newStats };
    });
  }, []);

  const addPopcorn = useCallback((amount: number) => {
    setGameState(prev => ({ ...prev, popcorn: prev.popcorn + amount }));
  }, []);

  const consumeItem = useCallback((itemId: ItemId, amount: number = 1) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [itemId]: Math.max(0, (prev.inventory[itemId] || 0) - amount)
      }
    }));
  }, []);

  const unlockItem = useCallback((itemId: ItemId) => {
    setGameState(prev => ({
      ...prev,
      unlockedItems: prev.unlockedItems.includes(itemId)
        ? prev.unlockedItems
        : [...prev.unlockedItems, itemId]
    }));
  }, []);

  const equipItem = useCallback((slot: 'hat' | 'glasses' | 'accessory', itemId: ItemId) => {
    setGameState(prev => ({
      ...prev,
      equipped: { ...prev.equipped, [slot]: itemId }
    }));
  }, []);

  const setHasPoop = useCallback((hasPoop: boolean) => {
    setGameState(prev => ({ ...prev, hasPoop }));
  }, []);

  return {
    gameState,
    setGameState,
    updateStats,
    addPopcorn,
    consumeItem,
    unlockItem,
    equipItem,
    setHasPoop,
  };
};
