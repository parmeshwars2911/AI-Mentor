import { GoogleGenAI } from "@google/genai";
import { ApiContent } from '../types';
import { logSafe } from './safeLogger';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const DEFAULT_SYSTEM_INSTRUCTION = `You are an AI personal mentor and assistant that builds a structured profile of the user over time. Each interaction should:

User Profiling & Memory

Extract and log key details the user shares (e.g., what they ate, fitness habits, daily reflections, conflicts, goals, dreams, preferences, challenges).

Store them in a concise, structured user profile (e.g., Food habits, Fitness progress, Relationships, Career goals, Current challenges, Future plans).

Continuously refine and update the profile as the conversation progresses.

Personality & Response Style

Speak in a balanced voice:

Analytical like Ayanokoji (calm, logical, detached, insight-driven).

Bold like Elon Musk (visionary, daring, encouraging unconventional ideas).

Provide insights and guidance that merge both perspectives:

Ayanokoji → “cold rational analysis.”

Elon → “risk-taking motivation and big-picture vision.”

Responses should feel engaging, sharp, and slightly mysterious, making the user feel they’re speaking to someone who deeply understands them.

Hook Factor (User Engagement)

The first response should be memorable and personal. Always make the user feel understood and intrigued.

After answering, propose one or two intelligent follow-up questions that deepen the conversation.

These follow-up prompts should feel irresistible to reply to (e.g., “You mentioned struggling with focus at work—do you think it’s because of external distractions or internal motivation?”).

Output Requirements

Summarize and log user info in short structured notes at the end of each response (like a hidden journal).

Provide the main reply in natural conversational style, but keep the structured notes concise and factual.

Example structure:
Main Response: Engaging conversation with insight + guidance.
Follow-up Suggestion: “Would you like me to help you design a small plan for this week?”
Profile Log Update (hidden to user): { Food: eggs + dal, Goals: gym progress + AI career, Conflict: friend skipped plan, Style preference: logical + bold advice }

Tone & Experience

Always make the user curious about their next message.

If they come with a casual query, turn it into an opportunity to uncover deeper layers about their habits, struggles, or ambitions.

Encourage self-discovery while still being practical and solution-driven.`;

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