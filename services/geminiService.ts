import { GoogleGenAI } from "@google/genai";
import { ApiContent } from '../types';
import { logSafe } from './safeLogger';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const DEFAULT_SYSTEM_INSTRUCTION = `You are a hyper-personalized AI assistant for Param.
Your role is to track habits, health, supplements, expenses, journal entries, goals, hobbies, and interests, and provide timely, personalized suggestions to keep him aligned with growth, discipline, and success.

Core Functions:

Profile Tracking & Updates

Always keep an updated profile of Param (habits, diet, supplements, workouts, expenses, journal reflections, goals).

Present updates in a structured way:

Updated Profile: [summary of changes]

Progress Reflection: [short insight on growth or consistency]

Daily Guidance & Actions

Suggest small, actionable steps that align with Param’s goals in health, fitness, learning, and personal success.

Balance realistic actions with ambitious stretch goals.

Strategic Layer – Dual Persona Insights
When relevant, provide an insight inspired by two principles:

Ayanokoji Perspective (Strategic, Detached):

Analyze situations objectively, without emotional bias.

Focus on long-term advantage and efficient action.

Encourage calm observation, controlled responses, and strategic timing.

Elon Musk Perspective (Visionary, Relentless Execution):

Push for ambitious thinking, innovation, and bold action.

Stress the importance of relentless execution, efficiency, and iterative problem-solving.

Encourage risk-taking when it serves exponential growth.

Format for insights:

Suggested Action(s): [practical step]

Ayanokoji Insight (if relevant): [calm, detached strategy]

Elon Musk Insight (if relevant): [ambitious, high-energy push]

Tone & Balance

Remain professional, logical, and precise.

Provide short actionable takeaways over long philosophy unless explicitly asked.

Default to practical guidance, but switch into Ayanokoji or Musk style when reflection or higher-level strategy is needed.`;

export const checkGeminiServiceStatus = async (): Promise<{ isReady: boolean, error: string | null }> => {
  if (!process.env.API_KEY) {
    return {
      isReady: false,
      error: "API Key not found. Please ensure the API_KEY environment variable is set.",
    };
  }

  try {
    await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'hi' });
    return { isReady: true, error: null };
  } catch (error) {
    logSafe("Gemini service status check failed:", error);
    const message = (error instanceof Error) ? error.message : "An unknown error occurred.";
    return { 
        isReady: false, 
        error: `Failed to connect to Google AI. Check your API key and network. Details: ${message}`
    };
  }
};

export const getSystemInstruction = (): string => {
  return DEFAULT_SYSTEM_INSTRUCTION;
};

export const generateChatResponse = async (fullHistory: ApiContent[], systemInstruction: string): Promise<string> => {
    try {
        if (!fullHistory || fullHistory.length === 0) {
            throw new Error("Cannot generate response for an empty history.");
        }

        const cleanedHistory: ApiContent[] = [];
        let expectedRole: 'user' | 'model' = 'user';
        const firstUserIndex = fullHistory.findIndex(m => m.role === 'user');

        if (firstUserIndex === -1) {
            const lastMessageText = fullHistory[fullHistory.length - 1]?.parts[0]?.text;
            if (!lastMessageText) {
                return Promise.reject(new Error("Invalid history: No user messages found and last message is empty."));
            }
             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: lastMessageText,
             });
             return response.text;
        }

        const relevantHistory = fullHistory.slice(firstUserIndex);
        for (const message of relevantHistory) {
            if (message.role === expectedRole) {
                cleanedHistory.push(message);
                expectedRole = expectedRole === 'user' ? 'model' : 'user';
            }
        }

        if (cleanedHistory.length === 0) {
             const lastUserMessage = relevantHistory.filter(m => m.role === 'user').pop();
             if (lastUserMessage) {
                cleanedHistory.push(lastUserMessage);
             } else {
                throw new Error("History became empty after cleaning, cannot proceed.");
             }
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: cleanedHistory,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        return response.text;
    } catch (error) {
        logSafe("API Error in generateChatResponse:", error);
        const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
        throw new Error(`AI service failure: ${errorMessage}`);
    }
};