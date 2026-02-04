import React, { useEffect, useRef, useState, useCallback } from 'react';
import { COLORS } from '../constants';
import { useGame } from '../context/GameContext';

interface Props {
  onGameOver: (score: number, stars: number) => void;
  onExit: () => void;
  cursorPos: { x: number; y: number };
  onCrash: () => void;
}

// Simple Grid Map: 1 = Wall, 0 = Path, 2 = Start, 3 = End
// 10 columns, 6 rows
const LEVEL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 0, 0, 1, 0, 0, 0, 3, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const CELL_SIZE = 80; // Approximate size, we'll use flex/grid in reality but need logic coords
const MAZE_COLS = 10;
const MAZE_ROWS = 6;

const MazeGameScene: React.FC<Props> = ({ onGameOver, onExit, cursorPos, onCrash }) => {
  const { playSfx } = useGame();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'crashed' | 'won'>('waiting');
  const [score, setScore] = useState(1000); // Score decreases over time
  const [attempts, setAttempts] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const wallRefs = useRef<(HTMLDivElement | null)[]>([]);
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Timer for score
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timer = setInterval(() => {
      setScore(s => Math.max(0, s - 10));
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Collision Logic
  useEffect(() => {
    // Only check collision if playing
    if (gameState === 'waiting') {
       // Check if cursor is in Start Zone to begin
       if (startRef.current) {
         const rect = startRef.current.getBoundingClientRect();
         if (
           cursorPos.x >= rect.left && cursorPos.x <= rect.right &&
           cursorPos.y >= rect.top && cursorPos.y <= rect.bottom
         ) {
           setGameState('playing');
           playSfx('step'); // Reusing step sound for start
         }
       }
       return;
    }

    if (gameState !== 'playing') return;

    // Check Wall Collisions
    // We assume the goose has a small hitbox radius (~10px)
    const hitBox = 10;
    
    // 1. Check Walls
    for (const wall of wallRefs.current) {
      if (!wall) continue;
      const rect = wall.getBoundingClientRect();
      
      // Simple AABB collision (Point vs Rect with slight radius padding)
      // Shrinking wall rect slightly to be forgiving? Or growing cursor?
      // Let's be strict but fair.
      if (
        cursorPos.x + hitBox > rect.left &&
        cursorPos.x - hitBox < rect.right &&
        cursorPos.y + hitBox > rect.top &&
        cursorPos.y - hitBox < rect.bottom
      ) {
        handleCrash();
        return;
      }
    }

    // 2. Check End Zone
    if (endRef.current) {
      const rect = endRef.current.getBoundingClientRect();
      if (
        cursorPos.x > rect.left && cursorPos.x < rect.right &&
        cursorPos.y > rect.top && cursorPos.y < rect.bottom
      ) {
        handleWin();
      }
    }
  }, [cursorPos, gameState, playSfx]);

  const handleCrash = () => {
    setGameState('crashed');
    setAttempts(a => a + 1);
    setScore(s => Math.max(0, s - 100)); // Penalty
    onCrash(); // Triggers shock visual in App
    playSfx('honk'); // Scared honk
  };

  const handleWin = () => {
    setGameState('won');
    // Calculate stars
    const stars = score > 700 ? 3 : score > 400 ? 2 : 1;
    onGameOver(score, stars);
  };

  const retry = () => {
    setGameState('waiting');
  };

  return (
    <div className={`h-screen w-screen bg-green-800 flex items-center justify-center relative`}>
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 text-white z-20 font-bold text-xl drop-shadow-md">
        Score: {score} | Attempts: {attempts}
      </div>
      
      <button 
        onClick={onExit}
        className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center"
      >
        ✕
      </button>

      {/* Maze Container */}
      <div 
        ref={containerRef}
        className="relative bg-stone-200 rounded-lg shadow-2xl p-4 grid gap-1 select-none"
        style={{
          gridTemplateColumns: `repeat(${MAZE_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${MAZE_ROWS}, 1fr)`,
          width: '90vw',
          height: '80vh',
          maxWidth: '1000px',
          maxHeight: '600px'
        }}
      >
        {LEVEL_MAP.flat().map((cell, idx) => {
          const isWall = cell === 1;
          const isStart = cell === 2;
          const isEnd = cell === 3;
          
          if (isWall) {
            return (
              <div 
                key={idx} 
                ref={el => { wallRefs.current[idx] = el; }}
                className="bg-green-700 rounded-sm shadow-inner border border-green-900/30 relative"
              >
                {/* Hedge Texture detail */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')]"></div>
              </div>
            );
          }
          if (isStart) {
            return (
              <div 
                key={idx} 
                ref={startRef}
                className={`flex items-center justify-center bg-blue-200/50 rounded-full border-4 border-blue-400 animate-pulse`}
              >
                <span className="text-blue-600 font-bold text-sm text-center">START<br/>HERE</span>
              </div>
            );
          }
          if (isEnd) {
            return (
              <div 
                key={idx} 
                ref={endRef}
                className="flex items-center justify-center bg-yellow-200/50 rounded-full border-4 border-yellow-400"
              >
                 <span className="text-3xl">🏁</span>
              </div>
            );
          }
          return <div key={idx} className="bg-stone-200" />;
        })}
      </div>

      {/* States Overlay */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 bg-black/40 z-30 flex flex-col items-center justify-center backdrop-blur-sm">
           <h2 className="text-5xl text-red-500 font-bold mb-4 drop-shadow-lg rotate-[-5deg]">OUCH!</h2>
           <p className="text-white text-xl mb-8">You touched the hedge!</p>
           <button 
             onClick={retry}
             className="bg-white text-green-700 font-bold py-3 px-8 rounded-full shadow-lg hover:scale-110 transition-transform text-xl"
           >
             Try Again
           </button>
        </div>
      )}

      {gameState === 'waiting' && attempts > 0 && (
        <div className="absolute bottom-10 text-white font-bold animate-bounce bg-black/20 px-4 py-2 rounded-full">
           Go back to the START circle!
        </div>
      )}
      
      {gameState === 'waiting' && attempts === 0 && (
        <div className="absolute bottom-10 text-white font-bold animate-bounce bg-black/20 px-4 py-2 rounded-full">
           Move to START to begin!
        </div>
      )}
    </div>
  );
};

export default MazeGameScene;