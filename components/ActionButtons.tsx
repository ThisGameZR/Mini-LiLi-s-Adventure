import React from 'react';
import { ItemId } from '../types';

interface ActionButtonsProps {
  onFeed: () => void;
  onSmartTime: () => void;
  onShop: () => void;
  onAdventure: () => void;
  lasagnaCount: number;
  isSmartTimeDisabled: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onFeed,
  onSmartTime,
  onShop,
  onAdventure,
  lasagnaCount,
  isSmartTimeDisabled,
}) => {
  return (
    <>
      {/* Bottom Actions */}
      <div className="w-full px-4 grid grid-cols-3 gap-4 mb-4">
        {/* Feed */}
        <button 
          onClick={onFeed}
          className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-1">🍕</div>
          <span className="font-bold text-sm text-gray-600">Feed ({lasagnaCount})</span>
        </button>

        {/* Smart Time */}
        <button 
          onClick={onSmartTime}
          disabled={isSmartTimeDisabled}
          className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform disabled:opacity-50"
        >
          <div className="text-3xl mb-1">🧠</div>
          <span className="font-bold text-sm text-gray-600">Smart Time</span>
        </button>

        {/* Shop */}
        <button 
          onClick={onShop}
          className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform"
        >
          <div className="text-3xl mb-1">🛍️</div>
          <span className="font-bold text-sm text-gray-600">Shop</span>
        </button>
      </div>

      {/* Adventure Button */}
      <button 
        onClick={onAdventure}
        className="w-11/12 bg-lili-red text-white text-2xl font-black py-4 rounded-full shadow-xl border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all"
      >
        GO HUNT LASAGNA!
      </button>
    </>
  );
};
