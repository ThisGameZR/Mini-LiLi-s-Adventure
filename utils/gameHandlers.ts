import { Item, ItemId, Mood } from '../types';
import { POKE_TEXTS } from '../config/gameConfig';
import { generateGooseWisdom } from '../services/chatService';
import { createClickEffect, ClickEffect } from './clickEffects';

export const handlePoke = (
  e: React.PointerEvent<HTMLDivElement>,
  mood: Mood,
  updateStats: (delta: { energy?: number; joy?: number }) => void,
  effects: ClickEffect[],
  setEffects: React.Dispatch<React.SetStateAction<ClickEffect[]>>
) => {
  const text = POKE_TEXTS[Math.floor(Math.random() * POKE_TEXTS.length)];
  createClickEffect(e.clientX, e.clientY, text, effects, setEffects);

  if (mood === Mood.SLEEPY) {
    updateStats({ energy: 5 }); // Wake up
  } else if (mood !== Mood.MAD) {
    updateStats({ joy: 5 });
  }
};

export const handleSmartTime = async (
  geminiText: string | null,
  setGeminiText: (text: string | null) => void
) => {
  if (geminiText) return;
  setGeminiText("Thinking...");
  const wisdom = await generateGooseWisdom();
  setGeminiText(wisdom);
  setTimeout(() => setGeminiText(null), 8000);
};

export const handleFeed = (
  gameState: { inventory: Record<string, number> },
  consumeItem: (itemId: ItemId, amount?: number) => void,
  updateStats: (delta: { tummy: number; joy: number }) => void
) => {
  if ((gameState.inventory[ItemId.LASAGNA] || 0) > 0) {
    consumeItem(ItemId.LASAGNA, 1);
    updateStats({ tummy: 40, joy: 10 });
  } else {
    alert("No Lasagna! Go on an adventure!");
  }
};

export const handleBuyItem = (
  item: Item,
  gameState: { popcorn: number },
  setGameState: React.Dispatch<React.SetStateAction<any>>,
  unlockItem: (itemId: ItemId) => void,
  equipItem: (slot: 'hat' | 'glasses' | 'accessory', itemId: ItemId) => void
) => {
  if (gameState.popcorn >= item.cost) {
    setGameState((prev: any) => ({
      ...prev,
      popcorn: prev.popcorn - item.cost,
      inventory: item.id === ItemId.LASAGNA ? {
        ...prev.inventory,
        [ItemId.LASAGNA]: (prev.inventory[ItemId.LASAGNA] || 0) + 1
      } : prev.inventory,
    }));
    
    unlockItem(item.id);
    
    if (item.type !== 'FOOD') {
      const slot = item.type === 'COSMETIC' ? 'accessory' : 'hat';
      equipItem(slot, item.id);
    }
  }
};
