import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';

interface Props {
  onGameOver: (score: number, stars: number) => void;
  onExit: () => void;
  cursorPos: { x: number; y: number };
  onCrash: () => void;
  abilityTrigger: number; // Timestamp of last click/trigger
  onCooldownChange: (isCoolingDown: boolean) => void;
}

type DuckType = 'noble' | 'guard';
type GamePhase = 'intro' | 'stealth' | 'boss_approach' | 'escape' | 'won' | 'caught';

interface DuckEntity {
  id: number;
  x: number;
  y: number;
  type: DuckType;
  pattern: 'waltz' | 'march' | 'chase';
  cx?: number; // Center X for waltz
  cy?: number; // Center Y for waltz
  angle?: number;
  speed: number;
  frozenUntil: number;
}

const DuckKingdomScene: React.FC<Props> = ({ 
  onGameOver, 
  onExit, 
  cursorPos, 
  onCrash, 
  abilityTrigger,
  onCooldownChange
}) => {
  const { playSfx } = useGame();
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [ducks, setDucks] = useState<DuckEntity[]>([]);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [kingState, setKingState] = useState<'asleep' | 'awake'>('asleep');
  const [kingTimer, setKingTimer] = useState(0);
  const [score, setScore] = useState(2000);
  const [message, setMessage] = useState("Sneak past the Royal Ducks!");

  const prevCursorRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<number>(0);

  // Initialize Level
  useEffect(() => {
    // Generate Ducks
    const newDucks: DuckEntity[] = [];
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Waltz Ducks (Circles in the middle)
    for (let i = 0; i < 4; i++) {
      newDucks.push({
        id: i,
        x: 0, y: 0,
        type: 'noble',
        pattern: 'waltz',
        cx: width * 0.3 + (i * 150),
        cy: height * 0.5,
        angle: i * (Math.PI / 2),
        speed: 0.02,
        frozenUntil: 0
      });
    }

    // 2. Guard Ducks (Marching Lines at bottom/top)
    for (let i = 0; i < 6; i++) {
      newDucks.push({
        id: 10 + i,
        x: (width / 6) * i,
        y: height * 0.75,
        type: 'guard',
        pattern: 'march',
        speed: 3,
        frozenUntil: 0
      });
    }

    setDucks(newDucks);
    
    setTimeout(() => {
      setPhase('stealth');
    }, 2000);
  }, []);

  // Ability Trigger
  useEffect(() => {
    if (phase === 'intro' || phase === 'caught' || phase === 'won') return;
    
    const now = Date.now();
    if (now < cooldownUntil) return; // Still cooling down

    // Use a small buffer to ensure we don't trigger on initial mount if abilityTrigger is old
    if (Math.abs(now - abilityTrigger) < 100) {
      // Activate Ability: HONK
      playSfx('honk');
      setCooldownUntil(now + 5000);
      onCooldownChange(true);

      // Freeze ducks within range
      setDucks(prev => prev.map(d => {
        const dx = d.x - cursorPos.x;
        const dy = d.y - cursorPos.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 400) { // Large radius
          return { ...d, frozenUntil: now + 1500 };
        }
        return d;
      }));
    }
  }, [abilityTrigger]);

  // Cooldown Manager
  useEffect(() => {
    if (Date.now() > cooldownUntil) {
      onCooldownChange(false);
    } else {
      const timeout = setTimeout(() => onCooldownChange(false), cooldownUntil - Date.now());
      return () => clearTimeout(timeout);
    }
  }, [cooldownUntil, onCooldownChange]);

  // King State Logic (Boss Phase)
  useEffect(() => {
    if (phase !== 'boss_approach') return;
    
    const interval = setInterval(() => {
      setKingState(prev => {
        const next = prev === 'asleep' ? 'awake' : 'asleep';
        // Reset timer visual?
        return next;
      });
    }, 3000); // Toggle every 3 seconds

    return () => clearInterval(interval);
  }, [phase]);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      const now = Date.now();
      
      // Update Ducks
      setDucks(prev => prev.map(d => {
        if (now < d.frozenUntil) return d; // Frozen

        let nx = d.x;
        let ny = d.y;

        if (phase === 'escape') {
          // Chase logic
          const dx = cursorPos.x - d.x;
          const dy = cursorPos.y - d.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 5) {
             nx += (dx / dist) * (d.speed * 1.5); // Faster during escape
             ny += (dy / dist) * (d.speed * 1.5);
          }
        } else if (d.pattern === 'waltz' && d.cx && d.cy && d.angle !== undefined) {
          const radius = 80;
          d.angle += d.speed;
          nx = d.cx + Math.cos(d.angle) * radius;
          ny = d.cy + Math.sin(d.angle) * radius;
        } else if (d.pattern === 'march') {
          nx += d.speed;
          if (nx > window.innerWidth + 50) nx = -50;
        }

        return { ...d, x: nx, y: ny, angle: d.angle };
      }));

      // Collision Detection
      if (phase === 'stealth' || phase === 'escape' || phase === 'boss_approach') {
        // Ducks
        for (const d of ducks) {
          const dx = d.x - cursorPos.x;
          const dy = d.y - cursorPos.y;
          // Simple circle collision
          if (Math.sqrt(dx*dx + dy*dy) < 60) {
             handleCrash("Caught by a Duck!");
             return; 
          }
        }
      }

      // Boss Logic (Red Light / Green Light)
      if (phase === 'boss_approach') {
         // Check distance to Throne (Top Center)
         const throneY = 100;
         const throneX = window.innerWidth / 2;
         const distToThrone = Math.sqrt(Math.pow(cursorPos.x - throneX, 2) + Math.pow(cursorPos.y - throneY, 2));

         // If close enough, grab mechanics
         if (distToThrone < 100) {
            setMessage("CLICK THE KING TO STEAL!");
         }

         // Red Light Check
         if (kingState === 'awake') {
            const moveDelta = Math.sqrt(
              Math.pow(cursorPos.x - prevCursorRef.current.x, 2) + 
              Math.pow(cursorPos.y - prevCursorRef.current.y, 2)
            );
            if (moveDelta > 2) { // Tolerance
               handleCrash("The King saw you moving!");
               return;
            }
         }
      }
      
      // Escape Logic (Reaching Exit)
      if (phase === 'escape') {
         // Exit is at bottom center
         if (cursorPos.y > window.innerHeight - 50) {
           setPhase('won');
           onGameOver(score, 3);
         }
      }

      // Transition to Boss Phase
      if (phase === 'stealth' && cursorPos.y < 300) {
         setPhase('boss_approach');
         setMessage("Sshhh! Approach the King only when he sleeps!");
      }

      prevCursorRef.current = cursorPos;
      reqRef.current = requestAnimationFrame(loop);
    };

    if (phase !== 'intro' && phase !== 'caught' && phase !== 'won') {
      reqRef.current = requestAnimationFrame(loop);
    }
    
    return () => cancelAnimationFrame(reqRef.current);
  }, [ducks, cursorPos, phase, kingState, score, onGameOver]);

  const handleCrash = (reason: string) => {
    setPhase('caught');
    setMessage(reason);
    onCrash();
    setScore(s => Math.max(0, s - 500));
  };

  const handleKingClick = () => {
    if (phase === 'boss_approach') {
      const throneY = 100;
      const throneX = window.innerWidth / 2;
      const distToThrone = Math.sqrt(Math.pow(cursorPos.x - throneX, 2) + Math.pow(cursorPos.y - throneY, 2));
      
      if (distToThrone < 120) {
         setPhase('escape');
         setMessage("RUN!!! Get back to the bottom!");
         playSfx('win'); // Placeholder for alarm
      }
    }
  };

  const retry = () => {
    setPhase('stealth');
    setScore(2000);
    setMessage("Sneak past the Royal Ducks!");
    // Reset ducks pos?
  };

  return (
    <div 
      ref={containerRef}
      className="h-screen w-screen overflow-hidden relative cursor-none select-none"
      style={{
        background: `repeating-linear-gradient(45deg, #f0f0f0 0px, #f0f0f0 40px, #e0e0e0 40px, #e0e0e0 80px)`
      }}
    >
      {/* Carpet */}
      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-64 bg-red-800 border-x-4 border-yellow-500 opacity-80" />

      {/* HUD */}
      <div className="absolute top-4 left-4 z-50 bg-black/70 text-white p-4 rounded-xl">
        <div className="text-xl font-bold">Score: {score}</div>
        <div className="text-yellow-300 font-bold mt-2">{message}</div>
        {Date.now() < cooldownUntil && (
           <div className="text-gray-400 text-sm mt-1">Honk Recharging...</div>
        )}
      </div>

      <button 
        onClick={onExit}
        className="absolute top-4 right-4 z-50 bg-black/20 hover:bg-black/40 text-black rounded-full p-2 w-10 h-10 flex items-center justify-center font-bold"
      >
        ✕
      </button>

      {/* Throne / King */}
      <div 
        onClick={handleKingClick}
        className="absolute top-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center transition-transform hover:scale-105"
      >
         {/* King Visual */}
         <div className="relative">
             <div className="text-8xl">{phase === 'escape' || phase === 'won' ? '😱' : kingState === 'awake' ? '👀' : '😴'}</div>
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-6xl">👑</div>
         </div>
         {phase !== 'escape' && phase !== 'won' && (
           <div className="mt-2 bg-yellow-400 border-2 border-yellow-600 w-16 h-10 rounded-lg shadow-lg flex items-center justify-center text-xs font-bold text-yellow-900">
             BREAD
           </div>
         )}
      </div>

      {/* Ducks */}
      {ducks.map(duck => (
        <div 
          key={duck.id}
          className="absolute flex flex-col items-center justify-center transition-transform duration-100"
          style={{
            left: duck.x,
            top: duck.y,
            transform: `translate(-50%, -50%) ${Date.now() < duck.frozenUntil ? 'scale(0.9) grayscale(100%)' : 'scale(1)'}`
          }}
        >
          <div className="text-5xl">
             {duck.type === 'guard' ? '🛡️🦆' : '🎩🦆'}
          </div>
          {Date.now() < duck.frozenUntil && (
            <div className="text-blue-500 font-bold text-xs absolute -top-4">FROZEN</div>
          )}
        </div>
      ))}

      {/* Caught Overlay */}
      {phase === 'caught' && (
        <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center">
           <h2 className="text-5xl text-red-500 font-bold mb-4">CAUGHT!</h2>
           <p className="text-white text-xl mb-8">{message}</p>
           <button 
             onClick={retry}
             className="bg-white text-black font-bold py-3 px-8 rounded-full shadow-lg hover:scale-110 transition-transform"
           >
             Try Again
           </button>
        </div>
      )}

      {/* Start Zone Indication */}
      {phase === 'stealth' && (
         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center animate-pulse">
            <div className="text-4xl">⬆️</div>
            <div className="bg-white/80 px-2 rounded">Sneak Up!</div>
         </div>
      )}

      {/* Exit Zone Indication */}
      {phase === 'escape' && (
         <div className="absolute bottom-0 left-0 right-0 h-24 bg-green-500/30 border-t-4 border-green-500 flex items-center justify-center text-green-900 font-bold text-2xl animate-pulse">
            ESCAPE HERE!
         </div>
      )}

    </div>
  );
};

export default DuckKingdomScene;