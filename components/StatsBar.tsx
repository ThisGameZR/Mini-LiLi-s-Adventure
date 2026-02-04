import React from 'react';
import { Stats } from '../types';

interface StatsBarProps {
  stats: Stats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="flex gap-2 w-full max-w-md px-4 pt-4 z-10">
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className="flex-1 bg-white rounded-xl shadow p-2 flex flex-col items-center">
          <span className="text-xs uppercase font-bold text-gray-500">{key}</span>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
            <div 
              className={`h-2.5 rounded-full ${value < 30 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${value}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};
