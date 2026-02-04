import React from 'react';

interface PoopIndicatorProps {
  onClean: () => void;
}

export const PoopIndicator: React.FC<PoopIndicatorProps> = ({ onClean }) => {
  return (
    <div className="absolute bottom-10 right-10 flex flex-col items-center z-10 animate-bounce">
      <div className="text-5xl filter drop-shadow-md cursor-pointer" onClick={onClean}>💩</div>
      <button 
        onClick={onClean}
        className="mt-1 bg-blue-500 text-white font-bold py-1 px-3 rounded-full shadow-lg text-sm hover:bg-blue-600 hover:scale-110 transition-transform"
      >
        🧹 CLEAN
      </button>
    </div>
  );
};
