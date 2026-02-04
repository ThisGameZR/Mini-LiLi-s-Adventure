import React, { useEffect, useRef, useState } from 'react';
import { CURSOR_LAG } from '../constants';

type Mood = 'neutral' | 'happy' | 'angry';

// Simple Goose SVG Component
const GooseSVG = ({ 
  direction, 
  isClicking, 
  mood, 
  isIdle,
  costume,
  isCoolingDown,
  isSpicy
}: { 
  direction: 'left' | 'right'; 
  isClicking: boolean; 
  mood: Mood;
  isIdle: boolean;
  costume?: 'none' | 'tuxedo';
  isCoolingDown?: boolean;
  isSpicy?: boolean;
}) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 100 100"
    className={`transition-transform duration-100 ${direction === 'left' ? 'scale-x-[-1]' : ''}`}
    style={{ overflow: 'visible', filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))' }}
  >
    <defs>
      <filter id="spicyFilter">
        <feColorMatrix type="matrix" values="
          1 0 0 0 0
          0 0.5 0 0 0
          0 0 0.5 0 0
          0 0 0 1 0 "/>
      </filter>
    </defs>

    <g style={isSpicy ? { filter: 'sepia(1) saturate(5) hue-rotate(-50deg)' } : {}}>
      {/* Body */}
      <path d="M20,60 Q20,90 50,90 Q80,90 80,60 Q80,30 50,30 Q20,30 20,60" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Neck & Head */}
      <path d="M70,50 Q90,20 70,10 Q50,10 60,40" fill="white" stroke="black" strokeWidth="2" />
      <circle cx="70" cy="15" r="12" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Eyes based on State */}
      {isIdle ? (
        // Sleeping Eyes (Closed)
        <path d="M68,14 Q74,18 80,14" fill="none" stroke="black" strokeWidth="2" opacity="0.6" />
      ) : mood === 'angry' || isSpicy ? (
        // Angry Eye (Slanted eyebrow + red pupil)
        <g>
          <line x1="66" y1="8" x2="80" y2="14" stroke="black" strokeWidth="2" />
          <circle cx="74" cy="14" r="2" fill={isSpicy ? "#ffff00" : "#d32f2f"} />
        </g>
      ) : mood === 'happy' ? (
        // Happy Eye (^ shape)
        <path d="M70,14 L74,10 L78,14" fill="none" stroke="black" strokeWidth="2" />
      ) : (
        // Neutral Eye
        <circle cx="74" cy="12" r="2" fill="black" />
      )}
      
      {/* Beak */}
      {/* If cooling down, beak is grey */}
      {isClicking ? (
         <path d="M80,12 L95,8 L95,16 Z" fill={isCoolingDown ? "#9ca3af" : "orange"} stroke="black" strokeWidth="1" />
      ) : (
         <path d="M80,15 L95,15 L80,20 Z" fill={isCoolingDown ? "#9ca3af" : "orange"} stroke="black" strokeWidth="1" />
      )}
      
      {/* Feet */}
      <path d="M40,90 L40,100" stroke="orange" strokeWidth="4" />
      <path d="M60,90 L60,100" stroke="orange" strokeWidth="4" />

      {/* Costume: Tuxedo */}
      {costume === 'tuxedo' && (
        <g>
          {/* Bow Tie */}
          <path d="M65,45 L58,40 L65,35 L72,40 Z" fill="#ef4444" stroke="black" strokeWidth="1" />
          {/* Top Hat */}
          <rect x="60" y="-10" width="20" height="25" fill="#1f2937" stroke="black" />
          <rect x="55" y="15" width="30" height="5" fill="#1f2937" stroke="black" />
          {/* Monocle Chain (optional detail) */}
          <path d="M70,40 Q80,45 80,60" fill="none" stroke="#fbbf24" strokeWidth="1" />
        </g>
      )}
    </g>

    {/* Fire Particles for Spicy Mode */}
    {isSpicy && (
       <g transform="translate(80, 20)">
         <circle cx="10" cy="0" r="3" fill="orange" className="animate-ping" />
         <circle cx="15" cy="-5" r="2" fill="red" className="animate-ping" style={{ animationDelay: '0.1s'}} />
       </g>
    )}

    {/* Status Bubbles */}
    {isIdle && !isClicking && (
       <g transform={`translate(${direction === 'left' ? -10 : 70}, -30)`}>
          <text x="0" y="0" fontSize="20" fontWeight="bold" fill="#888" fontFamily="sans-serif">Zzz...</text>
       </g>
    )}

    {/* Interaction Bubbles */}
    {isClicking && (
       <g transform={`translate(${direction === 'left' ? -20 : 80}, -20) rotate(${direction === 'left' ? -15 : 15})`}>
          {mood === 'angry' ? (
            <g>
              {/* Jagged Bubble */}
              <path d="M0,0 L10,-15 L20,-5 L30,-20 L40,-5 L50,-15 L40,10 L50,25 L30,15 L20,30 L10,15 L0,25 Z" fill="white" stroke="black" />
              <text x="10" y="5" fontSize="16" fontWeight="bold" fill="#d32f2f" stroke="none" fontFamily="sans-serif">HÖNK!</text>
            </g>
          ) : mood === 'happy' ? (
            <g>
               {/* Heart Bubble */}
               <path d="M0,0 L20,-10 L40,0 L20,30 Z" fill="pink" stroke="pink" />
               <text x="5" y="10" fontSize="20" fill="#e91e63">♥</text>
            </g>
          ) : (
            <g>
              {/* Normal Bubble */}
              <path d="M0,0 L20,-10 L40,0 L20,30 Z" fill="white" stroke="black" />
              <text x="5" y="10" fontSize="16" fontWeight="bold" fill="#ff6b6b" stroke="none" fontFamily="sans-serif">HONK!</text>
            </g>
          )}
       </g>
    )}
  </svg>
);

interface GooseCursorProps {
  onPositionChange?: (x: number, y: number) => void;
  onClick?: () => void;
  isShocked?: boolean;
  scale?: number;
  costume?: 'none' | 'tuxedo';
  isCoolingDown?: boolean;
  isSpicy?: boolean;
}

const GooseCursor: React.FC<GooseCursorProps> = ({ 
  onPositionChange, 
  onClick, 
  isShocked, 
  scale = 1,
  costume = 'none',
  isCoolingDown = false,
  isSpicy = false
}) => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isClicking, setIsClicking] = useState(false);
  
  // Interaction States
  const [mood, setMood] = useState<Mood>('neutral');
  const [isIdle, setIsIdle] = useState(false);
  const lastMoveTime = useRef(Date.now());

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      // Flip direction based on movement intention
      if (e.movementX > 0) setDirection('right');
      if (e.movementX < 0) setDirection('left');
      
      // Reset Idle
      lastMoveTime.current = Date.now();
      setIsIdle(false);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
      setIsIdle(false);
      lastMoveTime.current = Date.now();
      
      // Random Mood Logic
      const rand = Math.random();
      if (rand < 0.1) setMood('angry'); // 10% Chance
      else if (rand < 0.3) setMood('happy'); // 20% Chance
      else setMood('neutral');

      if (onClick) onClick();
    };
    
    const handleMouseUp = () => {
      setIsClicking(false);
      // Reset mood shortly after release
      setMood('neutral');
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Idle Timer
    const idleInterval = setInterval(() => {
      if (Date.now() - lastMoveTime.current > 3000 && !isIdle) {
        setIsIdle(true);
      }
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      clearInterval(idleInterval);
    };
  }, [onClick, isIdle]);

  // Animation Loop for Smooth Physics (Lerp)
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      if (cursorRef.current) {
        // Lerp factor
        const ease = isSpicy ? 0.3 : CURSOR_LAG; // Faster/Jittery when spicy
        
        // Calculate new position
        pos.current.x += (mouse.current.x - pos.current.x) * ease;
        pos.current.y += (mouse.current.y - pos.current.y) * ease;

        // Apply transform
        cursorRef.current.style.transform = `translate3d(${pos.current.x - 40}px, ${pos.current.y - 40}px, 0) scale(${scale})`;
        
        // Report position to parent (e.g. for collision detection in minigames)
        if (onPositionChange) {
          onPositionChange(pos.current.x, pos.current.y);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [onPositionChange, scale, isSpicy]);

  return (
    <>
      <style>
        {`
          @keyframes shake {
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
          }
          .shake-anim {
            animation: shake 0.5s;
            animation-iteration-count: 1;
          }
          .shock-filter {
            filter: sepia(100%) hue-rotate(-50deg) saturate(600%) brightness(0.8);
          }
        `}
      </style>
      <div 
        ref={cursorRef} 
        className="fixed top-0 left-0 pointer-events-none z-[9999] will-change-transform"
        aria-hidden="true"
      >
        <div className={`${isShocked || (mood === 'angry' && isClicking) ? 'shake-anim' : ''}`}>
           <div className={`${isShocked ? 'shock-filter transition-all duration-75' : 'transition-all duration-300'}`}>
             <GooseSVG 
               direction={direction} 
               isClicking={isClicking} 
               mood={mood} 
               isIdle={isIdle} 
               costume={costume}
               isCoolingDown={isCoolingDown}
               isSpicy={isSpicy}
             />
           </div>
        </div>
      </div>
    </>
  );
};

export default GooseCursor;