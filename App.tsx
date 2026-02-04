import React, { useState } from 'react';
import { GameMode, ItemId, Item } from './types';
import LiLi from './components/LiLi';
import RunnerGame from './components/RunnerGame';
import { Shop } from './components/Shop';
import { StatsBar } from './components/StatsBar';
import { ActionButtons } from './components/ActionButtons';
import { PoopIndicator } from './components/PoopIndicator';
import { ThoughtBubble } from './components/ThoughtBubble';
import { ClickEffects } from './components/ClickEffects';
import { useGameState } from './hooks/useGameState';
import { useGameTick } from './hooks/useGameTick';
import { useMood } from './hooks/useMood';
import { useRandomChat } from './hooks/useRandomChat';
import { handlePoke, handleSmartTime, handleFeed, handleBuyItem } from './utils/gameHandlers';
import { ClickEffect } from './utils/clickEffects';

export default function App() {
  const [mode, setMode] = useState<GameMode>(GameMode.HOME);
  const [geminiText, setGeminiText] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);

  const {
    gameState,
    setGameState,
    updateStats,
    addPopcorn,
    consumeItem,
    unlockItem,
    equipItem,
    setHasPoop,
  } = useGameState();

  const mood = useMood({ gameState, geminiText });
  
  useGameTick({ mode, gameState, setGameState });
  useRandomChat({ mode, mood, geminiText, setGeminiText });

  const onPoke = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsInteracting(true);
    setTimeout(() => setIsInteracting(false), 150);
    handlePoke(e, mood, updateStats, clickEffects, setClickEffects);
  };

  const onSmartTime = () => {
    handleSmartTime(geminiText, setGeminiText);
  };

  const onFeed = () => {
    handleFeed(gameState, consumeItem, updateStats);
  };

  const onCleanPoop = () => {
    setHasPoop(false);
    updateStats({ joy: 15 });
  };

  const onBuyItem = (item: Item) => {
    handleBuyItem(item, gameState, setGameState, unlockItem, equipItem);
  };

  const onGameOver = (popcornEarned: number, eatenLasagna: boolean) => {
    addPopcorn(popcornEarned);
    updateStats({
      tummy: eatenLasagna ? 100 : gameState.stats.tummy - 20,
      energy: gameState.stats.energy - 30,
    });
    setMode(GameMode.HOME);
  };

  if (mode === GameMode.ADVENTURE) {
    return (
      <RunnerGame 
        onGameOver={onGameOver} 
        hasSuperJump={gameState.unlockedItems.includes(ItemId.RED_CAPE)}
        hasSantaSuit={gameState.unlockedItems.includes(ItemId.SANTA_SUIT)}
      />
    );
  }

  if (mode === GameMode.SHOP) {
    return (
      <Shop 
        gameState={gameState}
        onBuyItem={onBuyItem}
        onClose={() => setMode(GameMode.HOME)}
      />
    );
  }

  // HOME MODE
  return (
    <div className="relative w-full h-full bg-lili-bg flex flex-col items-center justify-between pb-6 overflow-hidden">
      {/* Top Bar */}
      <StatsBar stats={gameState.stats} />
      <div className="absolute top-20 right-4 bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-300 font-bold text-yellow-800 shadow-sm">
        🍿 {gameState.popcorn}
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full">
        {geminiText && <ThoughtBubble text={geminiText} />}
        <ClickEffects effects={clickEffects} />

        <LiLi 
          mood={mood} 
          equipped={gameState.equipped} 
          isInteracting={isInteracting} 
          onClick={onPoke}
        />

        {gameState.hasPoop && <PoopIndicator onClean={onCleanPoop} />}
      </div>

      <ActionButtons
        onFeed={onFeed}
        onSmartTime={onSmartTime}
        onShop={() => setMode(GameMode.SHOP)}
        onAdventure={() => setMode(GameMode.ADVENTURE)}
        lasagnaCount={gameState.inventory[ItemId.LASAGNA] || 0}
        isSmartTimeDisabled={!!geminiText}
      />
    </div>
  );
}
