import React from 'react';
import { Mood, ItemId } from '../types';

interface LiLiProps {
  mood: Mood;
  equipped: {
    hat?: ItemId;
    glasses?: ItemId;
    accessory?: ItemId;
  };
  isInteracting: boolean;
  onClick: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const LiLi: React.FC<LiLiProps> = ({ mood, equipped, isInteracting, onClick }) => {
  const isMad = mood === Mood.MAD;
  const isSleepy = mood === Mood.SLEEPY;
  const isDancing = mood === Mood.DANCING;

  // Animation logic
  let animClass = "transition-transform duration-150 ease-in-out"; // Faster 150ms reset
  if (isDancing) animClass += " animate-waddle";
  if (isInteracting) animClass += " scale-90"; // Squish down instead of scale up for "plush" feel

  // Colors
  // If mad, she turns a slight pinkish-red, not scary red
  const bodyFill = isMad ? "fill-red-200" : "fill-white";
  const bodyStroke = isMad ? "stroke-red-400" : "stroke-gray-200";

  return (
    <div 
      className={`relative w-80 h-80 flex justify-center items-center cursor-pointer select-none ${animClass}`}
      onPointerDown={onClick}
      style={{ touchAction: 'none' }} // Prevent scrolling while poking
    >
      {/* ZZZ Bubble */}
      {isSleepy && (
        <div className="absolute top-0 right-20 animate-bounce bg-white px-3 py-1 rounded-full border border-gray-300 text-sm font-bold text-blue-400 z-10 shadow-sm">
          Zzz...
        </div>
      )}

      <svg viewBox="0 0 200 200" className={`w-full h-full drop-shadow-2xl ${isInteracting ? 'animate-jiggle' : ''}`}>
        
        {/* -- FEET (Stubby & Orange) -- */}
        <g className="fill-orange-400 stroke-orange-500 stroke-2">
          {/* Feet are simple rounded bumps at the bottom */}
          <path d="M 75 185 Q 85 198 95 185" strokeLinecap="round" strokeWidth="8" />
          <path d="M 105 185 Q 115 198 125 185" strokeLinecap="round" strokeWidth="8" />
        </g>

        {/* -- BODY (The Big Fat Blob with a Neck) -- */}
        <path 
          d="M 100 195
             C 35 195, 30 135, 75 115   
             Q 82 90, 82 65            
             C 82 35, 118 35, 118 65   
             Q 118 90, 125 115         
             C 170 135, 165 195, 100 195 Z"
          className={`${bodyFill} ${bodyStroke} stroke-[3]`} 
        />
        {/* Path Breakdown:
            1. Start Bottom Center (100, 195)
            2. Curve Left & Up to Shoulder (75, 115) - Very wide hips
            3. Neck Left (82, 90 to 82, 65) - Vertical but thick neck
            4. Head (82, 35 to 118, 35 to 118, 65) - Round top
            5. Neck Right (118, 90 to 125, 115)
            6. Curve Right & Down to Bottom - Wide hips again
        */}

        {/* -- WINGS (Tiny Flaps) -- */}
        {/* Adjusted to sit on the wider lower body */}
        <path 
          d="M 50 125 Q 38 140 52 155" 
          className={`${bodyFill} stroke-gray-300 stroke-[3]`} 
          fill="none"
        />
        <path 
          d="M 150 125 Q 162 140 148 155" 
          className={`${bodyFill} stroke-gray-300 stroke-[3]`} 
          fill="none"
        />

        {/* -- FACE (Moved Up) -- */}
        
        {/* Beak (The "Bean") */}
        <ellipse cx="100" cy="68" rx="16" ry="9" className="fill-orange-400 stroke-orange-500 stroke-2" />
        {/* Nostrils */}
        <circle cx="96" cy="66" r="1" className="fill-orange-700 opacity-50" />
        <circle cx="104" cy="66" r="1" className="fill-orange-700 opacity-50" />

        {/* Eyes (Wide set and small = Cute) */}
        {isSleepy ? (
           <g className="stroke-gray-700 stroke-[2] fill-none">
             {/* Closed eyes U shape */}
             <path d="M 84 56 Q 88 60 92 56" />
             <path d="M 108 56 Q 112 60 116 56" />
           </g>
        ) : isMad ? (
           <g>
             {/* Angry lines */}
             <line x1="82" y1="50" x2="94" y2="55" className="stroke-black stroke-2" />
             <line x1="118" y1="50" x2="106" y2="55" className="stroke-black stroke-2" />
             <circle cx="88" cy="56" r="3" className="fill-black" />
             <circle cx="112" cy="56" r="3" className="fill-black" />
           </g>
        ) : (
           <g>
             {/* Simple Beads */}
             <circle cx="88" cy="54" r="3.5" className="fill-black" />
             <circle cx="112" cy="54" r="3.5" className="fill-black" />
             {/* Tiny highlights */}
             <circle cx="89" cy="53" r="1.5" className="fill-white" />
             <circle cx="113" cy="53" r="1.5" className="fill-white" />
           </g>
        )}

        {/* Blush / Cheeks */}
        {!isMad && (
          <g className="fill-pink-300 opacity-60">
            <circle cx="78" cy="65" r="5" />
            <circle cx="122" cy="65" r="5" />
          </g>
        )}

        {/* -- ACCESSORIES (Repositioned for new head height) -- */}
        
        {/* Santa Hat */}
        {equipped.hat === ItemId.SANTA_SUIT && (
          <g transform="translate(68, 10) rotate(-10)">
            <path d="M 0 35 L 60 35 L 30 0 Z" className="fill-red-500 stroke-red-600 stroke-2" />
            <circle cx="30" cy="0" r="8" className="fill-white" />
            <rect x="-5" y="32" width="70" height="15" rx="7" className="fill-white" />
          </g>
        )}

        {/* Glasses (Big round Harry Potter style) */}
        {(equipped.glasses === ItemId.COOL_GLASSES || mood === Mood.SMART) && (
           <g transform="translate(0, -16)">
             <circle cx="88" cy="70" r="11" className="stroke-black stroke-2 fill-blue-100 opacity-50" />
             <circle cx="112" cy="70" r="11" className="stroke-black stroke-2 fill-blue-100 opacity-50" />
             <line x1="99" y1="70" x2="101" y2="70" className="stroke-black stroke-2" />
             <line x1="77" y1="70" x2="65" y2="65" className="stroke-black stroke-2" />
             <line x1="123" y1="70" x2="135" y2="65" className="stroke-black stroke-2" />
           </g>
        )}
        
        {/* Bow Tie (Sits at the base of the neck) */}
        {equipped.accessory === ItemId.RED_BOW && (
             <g transform="translate(100, 105)">
               <path d="M 0 0 L -18 -12 L -18 12 Z" className="fill-red-500 stroke-red-700" />
               <path d="M 0 0 L 18 -12 L 18 12 Z" className="fill-red-500 stroke-red-700" />
               <circle cx="0" cy="0" r="5" className="fill-red-600" />
             </g>
        )}

        {/* Red Cape */}
        {equipped.hat === ItemId.RED_CAPE && (
           <path d="M 75 115 Q 100 120 125 115 L 140 180 L 60 180 Z" className="fill-red-600 stroke-red-800 opacity-90" />
        )}

      </svg>
    </div>
  );
};

export default LiLi;