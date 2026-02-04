import React from 'react';
import { Scene } from '../types';
import { COLORS } from '../constants';

interface Props {
  onChangeScene: (scene: Scene) => void;
}

const MenuScene: React.FC<Props> = ({ onChangeScene }) => {
  return (
    <div className={`h-screen w-screen flex flex-col items-center justify-center ${COLORS.sky}`}>
      <h1 className="text-6xl font-bold text-white mb-8 drop-shadow-md text-center select-none">
        Mini LiLi's<br/>Adventure
      </h1>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-sm w-full z-10">
        <p className="text-gray-600 mb-4 text-center">
          Waddle, honk, and play! Use your mouse to control LiLi.
        </p>
        
        <button 
          onClick={() => onChangeScene(Scene.HUB)}
          className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-xl text-xl transition-transform hover:scale-105 active:scale-95"
        >
          Start Adventure
        </button>

        <div className="text-sm text-gray-400 mt-4">
          v0.1.0 - Pre-Alpha
        </div>
      </div>
      
      <div className="absolute bottom-4 text-white opacity-50 text-sm">
        Made with ❤️ & Honks
      </div>
    </div>
  );
};

export default MenuScene;
