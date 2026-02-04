import React, { useState, useRef, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Scene } from './types';
import GooseCursor from './components/GooseCursor';
import MenuScene from './scenes/MenuScene';
import HubScene from './scenes/HubScene';
import CatchGameScene from './scenes/CatchGameScene';
import MazeGameScene from './scenes/MazeGameScene';
import DuckKingdomScene from './scenes/DuckKingdomScene';
import { playHonk } from './utils/audio';

const GameContainer = () => {
  const { progress, currentScene, changeScene, unlockLevel, playSfx } = useGame();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isCursorShocked, setIsCursorShocked] = useState(false);
  const [cursorScale, setCursorScale] = useState(1);
  const [cursorCooldown, setCursorCooldown] = useState(false);
  const [isSpicy, setIsSpicy] = useState(false);
  const [abilityTrigger, setAbilityTrigger] = useState(0);
  const powerUpTimeoutRef = useRef<number | null>(null);

  const handleLevelComplete = (scene: Scene, score: number, stars: number) => {
    // Reset powerups on level exit
    if (powerUpTimeoutRef.current) {
      clearTimeout(powerUpTimeoutRef.current);
    }
    setCursorScale(1);
    setIsSpicy(false);
    
    unlockLevel(scene, score, stars);
    changeScene(Scene.HUB);
    playSfx('win');
  };

  const triggerShock = () => {
    setIsCursorShocked(true);
    // Reset after animation duration (0.5s)
    setTimeout(() => setIsCursorShocked(false), 500);
  };

  const activateSpicyMode = () => {
    setIsSpicy(true);
    if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
    powerUpTimeoutRef.current = window.setTimeout(() => {
      setIsSpicy(false);
    }, 5000); // 5 seconds of spicy
  };

  const handleCursorClick = () => {
    playHonk();
    // Signal ability trigger to scenes that listen for it
    setAbilityTrigger(Date.now());
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
    };
  }, []);

  const renderScene = () => {
    switch (currentScene) {
      case Scene.MENU:
        return <MenuScene onChangeScene={changeScene} />;
      case Scene.HUB:
        return <HubScene progress={progress} onChangeScene={changeScene} />;
      case Scene.GAME_CATCH:
        return (
          <CatchGameScene 
            onGameOver={(score, stars) => handleLevelComplete(Scene.GAME_CATCH, score, stars)} 
            onExit={() => {
               if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
               setCursorScale(1);
               setIsSpicy(false);
               changeScene(Scene.HUB);
            }}
            cursorPos={cursorPos}
            onCatchBadItem={triggerShock}
            onSetCursorScale={setCursorScale}
            onTriggerSpicy={activateSpicyMode}
            isSpicy={isSpicy}
          />
        );
      case Scene.GAME_MAZE:
        return (
           <MazeGameScene 
             onGameOver={(score, stars) => handleLevelComplete(Scene.GAME_MAZE, score, stars)}
             onExit={() => changeScene(Scene.HUB)}
             cursorPos={cursorPos}
             onCrash={triggerShock}
           />
        );
      case Scene.GAME_DUCK_KINGDOM:
        return (
           <DuckKingdomScene
             onGameOver={(score, stars) => handleLevelComplete(Scene.GAME_DUCK_KINGDOM, score, stars)}
             onExit={() => changeScene(Scene.HUB)}
             cursorPos={cursorPos}
             onCrash={triggerShock}
             abilityTrigger={abilityTrigger}
             onCooldownChange={setCursorCooldown}
           />
        );
      default:
        return <MenuScene onChangeScene={changeScene} />;
    }
  };

  return (
    <>
      <GooseCursor 
        onPositionChange={(x, y) => setCursorPos({ x, y })} 
        onClick={handleCursorClick}
        isShocked={isCursorShocked}
        scale={cursorScale}
        costume={currentScene === Scene.GAME_DUCK_KINGDOM ? 'tuxedo' : 'none'}
        isCoolingDown={cursorCooldown}
        isSpicy={isSpicy}
      />
      {renderScene()}
    </>
  );
};

const App = () => {
  return (
    <GameProvider>
      <GameContainer />
    </GameProvider>
  );
};

export default App;