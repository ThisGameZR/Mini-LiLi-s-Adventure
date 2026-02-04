import React, { useEffect, useRef, useState } from 'react';
import { Scene } from '../types';
import { COLORS } from '../constants';
import { useGame } from '../context/GameContext'; 

interface Props {
  onGameOver: (score: number, stars: number) => void;
  onExit: () => void;
  cursorPos: { x: number; y: number }; 
  onCatchBadItem?: () => void;
  onSetCursorScale: (scale: number) => void;
  onTriggerSpicy: () => void;
  isSpicy: boolean;
}

type ItemType = 'food' | 'cake' | 'veg' | 'pepper' | 'golden_crumb';

interface FallingItem {
  id: number;
  x: number;
  y: number;
  type: ItemType;
  caught: boolean;
  vx: number; // Horizontal velocity (wind)
  vy: number; // Fall speed
  emoji: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 1.0 to 0.0
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}

const FOOD_EMOJIS = ['🥪', '🍇', '🧀', '🍗', '🥐'];
const VEG_EMOJIS = ['🥦', '🥕', '🥬'];

const CatchGameScene: React.FC<Props> = ({ 
  onGameOver, 
  onExit, 
  cursorPos, 
  onCatchBadItem, 
  onSetCursorScale,
  onTriggerSpicy,
  isSpicy
}) => {
  const { playSfx } = useGame();
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'ended'>('intro');
  const [items, setItems] = useState<FallingItem[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [superMode, setSuperMode] = useState(false);
  const [wind, setWind] = useState(0);
  
  const reqRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const itemsCaughtRef = useRef<number>(0);
  const superModeTimer = useRef<number | null>(null);

  // Start Game
  useEffect(() => {
    const timer = setTimeout(() => setGameState('playing'), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Wind Logic
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      // Random wind every 10 seconds (-2 to 2)
      const newWind = (Math.random() * 4) - 2;
      setWind(newWind);
    }, 10000);
    return () => clearInterval(interval);
  }, [gameState]);

  // Super Mode Logic
  useEffect(() => {
    if (combo >= 100 && !superMode) {
      setSuperMode(true);
      if (superModeTimer.current) clearTimeout(superModeTimer.current);
      superModeTimer.current = window.setTimeout(() => {
        setSuperMode(false);
        setCombo(0);
      }, 5000);
    }
  }, [combo, superMode]);

  // Chubby Progression Logic
  useEffect(() => {
    // Max scale 2.5x
    const newScale = 1 + Math.min(1.5, itemsCaughtRef.current / 40);
    onSetCursorScale(newScale);
  }, [itemsCaughtRef.current, onSetCursorScale]); // Will trigger on re-render if ref changed in loop? No, need to force update if strictly relying on react state, but ref usage in loop is better for perf.
  // Actually, let's update scale inside the loop or when itemsCaught changes.
  // Since itemsCaughtRef is a Ref, this effect won't fire. We'll update scale in the game loop.

  const spawnFloatingText = (x: number, y: number, text: string, color: string) => {
    setFloatingTexts(prev => [...prev, {
      id: Math.random(),
      x, y, text, color, life: 1.0
    }]);
  };

  const spawnCrumbs = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for(let i=0; i<6; i++) {
       const angle = Math.random() * Math.PI * 2;
       const speed = Math.random() * 5 + 2;
       newParticles.push({
         id: Math.random(),
         x, y,
         vx: Math.cos(angle) * speed,
         vy: Math.sin(angle) * speed,
         life: 1.0,
         color: color,
         size: Math.random() * 6 + 4
       });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const loop = (time: number) => {
      // 1. Spawn Items
      const spawnRate = superMode ? 200 : 600;
      if (time - lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = time;
        
        let type: ItemType = 'food';
        let emoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
        let vy = 3 + Math.random() * 2;

        if (superMode) {
           type = 'cake';
           emoji = '🍰';
        } else {
           const rand = Math.random();
           if (rand > 0.95) {
             type = 'golden_crumb';
             emoji = '✨';
             vy = 8; // Fast!
           } else if (rand > 0.90) {
             type = 'pepper';
             emoji = '🌶️';
           } else if (rand > 0.70) {
             type = 'veg';
             emoji = VEG_EMOJIS[Math.floor(Math.random() * VEG_EMOJIS.length)];
           } else if (rand > 0.60) {
             type = 'cake';
             emoji = '🍰';
           }
        }

        const newItem: FallingItem = {
          id: time,
          x: Math.random() * (window.innerWidth - 60) + 30,
          y: -50,
          type,
          caught: false,
          vx: 0,
          vy,
          emoji
        };
        setItems(prev => [...prev, newItem]);
      }

      // 2. Physics & Collision
      setItems(prevItems => {
        const nextItems: FallingItem[] = [];
        const currentScale = 1 + Math.min(1.5, itemsCaughtRef.current / 40);
        
        // Sync scale with App
        // NOTE: Calling this every frame might be expensive if it triggers App re-render.
        // But since we pass setCursorScale, React state updates are batched. 
        // Ideally we only call it when it changes significantly, but for now it's okay.
        onSetCursorScale(currentScale);

        const collisionRadius = 50 * currentScale;

        for (const item of prevItems) {
           // Movement
           item.y += item.vy;
           item.x += item.vx + wind;
           
           // Wind bounds check (wrap around?) or clamp
           if (item.x < 0) item.x = window.innerWidth;
           if (item.x > window.innerWidth) item.x = 0;

           if (item.y > window.innerHeight) continue; // Despawn
           if (item.caught) continue;

           // Collision
           const dx = item.x - cursorPos.x;
           const dy = item.y - cursorPos.y;
           const dist = Math.sqrt(dx*dx + dy*dy);

           if (dist < collisionRadius) {
             // CAUGHT!
             playSfx('honk');
             
             if (item.type === 'veg') {
                // Bad item
                setScore(s => Math.max(0, s - 20));
                setCombo(0);
                spawnFloatingText(item.x, item.y, "EW...", "#4caf50");
                spawnCrumbs(item.x, item.y, "#4caf50");
                if (onCatchBadItem) onCatchBadItem();
             } else if (item.type === 'pepper') {
                // Spicy
                setScore(s => s + 50);
                spawnFloatingText(item.x, item.y, "SPICY!!", "red");
                onTriggerSpicy();
                itemsCaughtRef.current += 1;
             } else {
                // Good stuff
                let points = 10;
                let text = "YUM!";
                let color = "#ffa500"; // Orange

                if (item.type === 'cake') {
                  points = 30;
                  text = "SWEET!";
                  color = "#FF69B4"; // Pink
                } else if (item.type === 'golden_crumb') {
                  points = 100;
                  text = "DELICIOUS!";
                  color = "#FFD700"; // Gold
                }

                setScore(s => s + points);
                setCombo(c => Math.min(100, c + (superMode ? 0 : 10)));
                itemsCaughtRef.current += 1;
                spawnFloatingText(item.x, item.y, text, color);
                spawnCrumbs(item.x, item.y, color);
             }
             continue; // Don't add to nextItems
           }
           nextItems.push(item);
        }
        return nextItems;
      });

      // 3. Update Particles
      setParticles(prev => prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life - 0.05,
          vy: p.vy + 0.2
        })).filter(p => p.life > 0)
      );

      // 4. Update Floating Text
      setFloatingTexts(prev => prev.map(t => ({
          ...t,
          y: t.y - 2,
          life: t.life - 0.02
        })).filter(t => t.life > 0)
      );

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current);
  }, [gameState, cursorPos, wind, superMode, onSetCursorScale, onTriggerSpicy, onCatchBadItem, playSfx]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('ended');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Handle End
  useEffect(() => {
    if (gameState === 'ended') {
      const stars = score >= 1500 ? 3 : score >= 800 ? 2 : 1;
      setTimeout(() => onGameOver(score, stars), 3000);
    }
  }, [gameState, score, onGameOver]);

  return (
    <div className={`h-screen w-screen overflow-hidden relative cursor-none select-none ${COLORS.sky}`}>
      {/* Background Pattern: Picnic Blanket */}
      <div 
        className="absolute bottom-0 w-full h-1/3"
        style={{
          background: `repeating-linear-gradient(45deg, #e57373 25px, #ffcdd2 25px, #ffcdd2 50px, #e57373 50px, #e57373 75px, #ffcdd2 75px)`,
          borderTop: '10px solid white'
        }}
      />

      {/* Intro Text */}
      {gameState === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm">
           <div className="text-white text-center animate-bounce">
              <h1 className="text-6xl font-bold drop-shadow-lg text-red-400">Picnic Panic!</h1>
              <p className="text-2xl mt-4">Clean up the mess!</p>
           </div>
        </div>
      )}

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 z-40 flex justify-between items-start pointer-events-none">
        <div className="flex flex-col gap-2">
           <div className="text-3xl font-black text-white drop-shadow-md stroke-black">
              {score} PTS
           </div>
           <div className="bg-white/30 rounded-full h-4 w-48 overflow-hidden border-2 border-white relative">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                   width: `${combo}%`, 
                   background: superMode ? 'linear-gradient(90deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff)' : '#FFA500'
                }} 
              />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white shadow-black">
                 {superMode ? 'SUPER HONK MODE!' : 'HONK METER'}
              </div>
           </div>
        </div>
        
        <div className="text-4xl font-black text-white drop-shadow-md">
           {timeLeft}s
        </div>

        <div className="flex flex-col items-end">
           {wind !== 0 && (
             <div className="bg-blue-400/80 text-white px-3 py-1 rounded-lg font-bold animate-pulse">
                💨 WIND {wind > 0 ? '>>' : '<<'}
             </div>
           )}
        </div>
      </div>

      <button 
        onClick={onExit}
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center pointer-events-auto"
      >
        ✕
      </button>

      {/* Items */}
      {items.map(item => (
        <div
          key={item.id}
          className="absolute text-5xl select-none"
          style={{ 
            left: item.x, 
            top: item.y,
            transform: 'translate(-50%, -50%)',
            filter: item.type === 'golden_crumb' ? 'drop-shadow(0 0 10px gold)' : 'none'
          }}
        >
          {item.emoji}
        </div>
      ))}

      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            transform: `translate(-50%, -50%) rotate(${p.life * 360}deg)`,
          }}
        />
      ))}

      {/* Floating Text */}
      {floatingTexts.map(t => (
        <div
          key={t.id}
          className="absolute font-black text-2xl pointer-events-none drop-shadow-md"
          style={{
            left: t.x,
            top: t.y,
            color: t.color,
            opacity: t.life,
            transform: 'translate(-50%, -50%)'
          }}
        >
          {t.text}
        </div>
      ))}

      {gameState === 'ended' && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-50 text-white backdrop-blur-sm">
          <div className="text-6xl font-black mb-4 animate-bounce">FULL!</div>
          <div className="text-2xl">Final Score: {score}</div>
        </div>
      )}
    </div>
  );
};

export default CatchGameScene;