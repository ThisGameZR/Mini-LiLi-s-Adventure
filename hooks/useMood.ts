import { useEffect, useState } from 'react';
import { Mood, GameState } from '../types';

interface UseMoodProps {
  gameState: GameState;
  geminiText: string | null;
}

export const useMood = ({ gameState, geminiText }: UseMoodProps) => {
  const [mood, setMood] = useState<Mood>(Mood.HAPPY);

  useEffect(() => {
    const { tummy, energy, joy } = gameState.stats;
    if (gameState.hasPoop) {
      setMood(Mood.MAD); // She hates the mess
    } else if (energy < 20) {
      setMood(Mood.SLEEPY);
    } else if (tummy < 30 || joy < 20) {
      setMood(Mood.MAD);
    } else if (geminiText) {
      setMood(Mood.SMART); // Reading mode
    } else {
      setMood(Mood.HAPPY);
    }
  }, [gameState.stats, geminiText, gameState.hasPoop]);

  return mood;
};
