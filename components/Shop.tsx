import React from 'react';
import { GameState, Item, ItemId, GameMode } from '../types';
import { SHOP_ITEMS } from '../config/gameConfig';

interface ShopProps {
  gameState: GameState;
  onBuyItem: (item: Item) => void;
  onClose: () => void;
}

export const Shop: React.FC<ShopProps> = ({ gameState, onBuyItem, onClose }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-red-500 to-red-700 flex flex-col relative overflow-hidden font-sans">
      {/* Decorative Background Circles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-400 rounded-full mix-blend-screen filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-screen filter blur-3xl opacity-10 translate-x-1/2 translate-y-1/2"></div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-6 pb-4 flex justify-between items-center bg-black/10 backdrop-blur-sm border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="text-4xl filter drop-shadow-md">🛍️</div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">THE RED ROOM</h1>
            <p className="text-red-200 text-xs font-medium uppercase tracking-widest">Exclusive Merch</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-red-200 font-bold uppercase mb-1">Your Stash</span>
          <div className="bg-yellow-400 text-red-900 px-4 py-1.5 rounded-full font-black text-lg shadow-lg border-2 border-yellow-200 flex items-center gap-2 transform -rotate-2">
            <span>🍿</span>
            <span>{gameState.popcorn}</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <div className="grid grid-cols-2 gap-4">
          {SHOP_ITEMS.map(item => {
            const isUnlocked = gameState.unlockedItems.includes(item.id);
            const canAfford = gameState.popcorn >= item.cost;
            
            return (
              <div 
                key={item.id} 
                className={`
                  relative group bg-white rounded-3xl p-4 flex flex-col items-center shadow-xl transition-all duration-200
                  ${!isUnlocked && !canAfford ? 'opacity-80 grayscale-[0.3]' : 'hover:scale-[1.02]'}
                `}
              >
                {/* Badge for Type */}
                <div className="absolute top-3 left-3">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                    ${item.type === 'FOOD' ? 'bg-orange-100 text-orange-600' : 
                      item.type === 'COSMETIC' ? 'bg-purple-100 text-purple-600' : 
                      'bg-blue-100 text-blue-600'
                    }
                  `}>
                    {item.type}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-3 shadow-inner mt-4 border border-gray-100">
                  {item.icon}
                </div>

                {/* Info */}
                <h3 className="font-extrabold text-gray-800 text-lg leading-tight text-center mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 text-center mb-4 leading-relaxed px-1 h-8 flex items-center justify-center">
                  {item.description}
                </p>

                {/* Action */}
                <div className="w-full mt-auto">
                  {isUnlocked && item.type !== 'FOOD' ? (
                    <div className="w-full py-2 bg-green-100 text-green-700 font-black rounded-xl text-center text-sm border-2 border-green-200 flex items-center justify-center gap-1">
                      <span>✓</span> OWNED
                    </div>
                  ) : (
                    <button 
                      disabled={!canAfford}
                      onClick={() => onBuyItem(item)}
                      className={`
                        w-full py-2 rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95
                        ${canAfford 
                          ? 'bg-yellow-400 hover:bg-yellow-300 text-red-900 border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed border-b-4 border-gray-300'
                        }
                      `}
                    >
                      {canAfford ? 'BUY' : 'NEED 🍿'} 
                      {canAfford && <span className="bg-black/10 px-1.5 rounded text-xs">{item.cost}</span>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Close Button */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-sm px-6 pointer-events-none">
        <button 
          onClick={onClose} 
          className="pointer-events-auto w-full bg-white text-red-600 px-6 py-4 rounded-full font-black text-xl shadow-2xl border-4 border-red-100 hover:bg-red-50 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <span>❌</span> CLOSE SHOP
        </button>
      </div>
    </div>
  );
};
