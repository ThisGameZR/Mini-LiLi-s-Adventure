import { useEffect } from 'react';
import { GameMode, Mood } from '../types';
import { generateRandomChat } from '../services/chatService';

interface UseRandomChatProps {
  mode: GameMode;
  mood: Mood;
  geminiText: string | null;
  setGeminiText: (text: string | null) => void;
}

export const useRandomChat = ({ mode, mood, geminiText, setGeminiText }: UseRandomChatProps) => {
  useEffect(() => {
    if (mode !== GameMode.HOME || geminiText) return;

    const minDelay = 10000;
    const randomDelay = Math.random() * 20000;
    
    const timeoutId = setTimeout(async () => {
      if (mode === GameMode.HOME && !geminiText) {
        const chat = await generateRandomChat(mood);
        setGeminiText(chat);
        setTimeout(() => {
          setGeminiText(prev => prev === chat ? null : prev);
        }, 4000);
      }
    }, minDelay + randomDelay);

    return () => clearTimeout(timeoutId);
  }, [mode, geminiText, mood, setGeminiText]);
};
