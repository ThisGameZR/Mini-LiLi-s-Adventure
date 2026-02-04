import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize conditionally to avoid crashing if env is missing, though instructions say assume it's valid.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateGooseWisdom = async (): Promise<string> => {
  if (!ai) return "LoLo! (No API Key found)";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "You are a silly goose named LiLi. Say something smart but use VERY simple words. Max 8 words. Talk like a 5 year old. About lasagna or being round. You say 'LoLo' instead of 'Honk'.",
    });
    return response.text || "LoLo? (Thinking...)";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "LoLo... (Forgot thought)";
  }
};

export const generateStoryStart = async (): Promise<string> => {
  if (!ai) return "Once upon a time... LoLo!";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Write a very short opening for a goose story. Use simple words. Max 6 words.",
    });
    return response.text || "Let's go!";
  } catch (error) {
    return "Adventure time!";
  }
};

export const generateRandomChat = async (mood: string): Promise<string> => {
  if (!ai) {
    const fallbacks = ["LoLo!", "Feed me.", "So soft.", "Squawk."];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are LiLi, a cute goose. Your mood is ${mood}. 
      Say a very short phrase to your owner.
      RULES:
      1. Use ONLY simple words.
      2. Max 4 words.
      3. No hard words.
      4. Your catchphrase is "LoLo".
      Examples: "I want food", "LoLo LoLo", "So sleepy", "Pet me".`,
    });
    return response.text?.trim() || "LoLo!";
  } catch (error) {
    return "LoLo?";
  }
};