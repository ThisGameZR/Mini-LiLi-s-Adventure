import React from 'react';

interface ThoughtBubbleProps {
  text: string;
}

export const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ text }) => {
  if (!text) return null;

  return (
    <div className="absolute top-10 mx-8 bg-white p-4 rounded-3xl rounded-bl-none shadow-lg border-2 border-gray-200 z-20 animate-bounce-slow">
      <p className="text-center font-medium text-gray-700">&quot;{text}&quot;</p>
    </div>
  );
};
