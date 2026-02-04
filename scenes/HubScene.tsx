import React from 'react';
import { Scene, PlayerProgress } from '../types';
import { COLORS } from '../constants';

interface Props {
  progress: PlayerProgress;
  onChangeScene: (scene: Scene) => void;
}

const LevelCard = ({ 
  title, 
  scene, 
  stats, 
  onClick 
}: { 
  title: string; 
  scene: Scene; 
  stats: any; 
  onClick: () => void 
}) => {
  const isUnlocked = true;

  return (
    <div 
      onClick={isUnlocked ? onClick : undefined}
      className={`
        relative p-6 rounded-2xl w-64 h-40 flex flex-col items-center justify-center border-4 transition-all z-10
        ${isUnlocked 
          ? 'bg-white border-orange-400 cursor-pointer hover:scale-105 active:scale-95 shadow-lg' 
          : 'bg-gray-200 border-gray-400 cursor-not-allowed opacity-70'}
      `}
    >
      <h3 className={`text-xl font-bold mb-2 text-center ${isUnlocked ? 'text-gray-800' : 'text-gray-500'}`}>
        {title}
      </h3>
      
      {!isUnlocked && (
        <span className="text-2xl">🔒</span>
      )}

      {isUnlocked && (
        <div className="flex gap-1 mt-2">
           {[1, 2, 3].map(i => (
             <span key={i} className={`text-2xl ${i <= (stats?.stars || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
               ★
             </span>
           ))}
        </div>
      )}
      
      {isUnlocked && stats?.highScore > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          High Score: {stats.highScore}
        </div>
      )}
    </div>
  );
};

const HubScene: React.FC<Props> = ({ progress, onChangeScene }) => {
  return (
    <div className={`h-screen w-screen ${COLORS.grass} overflow-y-auto p-8`}>
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12 bg-white/50 p-4 rounded-xl backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-green-800">World Map</h2>
          <div className="flex gap-4">
             <div className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-bold">
               BreadCrumbs: {progress.currency}
             </div>
             <button 
               onClick={() => onChangeScene(Scene.MENU)}
               className="bg-white text-gray-600 px-4 py-2 rounded-full font-bold shadow hover:bg-gray-50"
             >
               Exit
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          <LevelCard 
            title="Stage 1: Lili's Lunch" 
            scene={Scene.GAME_CATCH} 
            stats={progress.levels[Scene.GAME_CATCH]}
            onClick={() => onChangeScene(Scene.GAME_CATCH)}
          />
          
          <LevelCard 
            title="Stage 2: Goose Garden" 
            scene={Scene.GAME_MAZE} 
            stats={progress.levels[Scene.GAME_MAZE]}
            onClick={() => onChangeScene(Scene.GAME_MAZE)}
          />
          
          <LevelCard 
            title="Stage 3: The Duck Kingdom" 
            scene={Scene.GAME_DUCK_KINGDOM} 
            stats={progress.levels[Scene.GAME_DUCK_KINGDOM]}
            onClick={() => onChangeScene(Scene.GAME_DUCK_KINGDOM)}
          />
        </div>
      </div>
    </div>
  );
};

export default HubScene;