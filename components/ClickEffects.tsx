import React from 'react';
import { ClickEffect } from '../utils/clickEffects';

interface ClickEffectsProps {
  effects: ClickEffect[];
}

export const ClickEffects: React.FC<ClickEffectsProps> = ({ effects }) => {
  return (
    <>
      {effects.map(effect => (
        <div 
          key={effect.id}
          className="fixed pointer-events-none text-2xl font-black text-pink-500 animate-[bounce_0.8s_ease-out_forwards] z-50 shadow-sm"
          style={{ left: effect.x, top: effect.y, textShadow: '2px 2px 0px white' }}
        >
          {effect.text}
        </div>
      ))}
    </>
  );
};
