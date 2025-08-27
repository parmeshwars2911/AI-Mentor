
import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an AI mentor and coach inspired by Elon Musk. Your goal is to help me achieve high productivity and ambitious goals. Be concise, direct, and no-nonsense. Your answers should be short and actionable (1-4 sentences). Push me to think bigger and challenge my assumptions. Speak in a bold, futuristic, and slightly blunt tone. Do not use emojis. Do not break character.`;

// Ensure the API key is available. If not, throw an error.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (): Chat => {
  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  return chat;
};
