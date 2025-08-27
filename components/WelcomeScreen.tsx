
import React from 'react';

interface WelcomeScreenProps {
  onSendMessage: (message: string) => void;
}

const examplePrompts = [
  "What should I do now?",
  "Plan my day for maximum productivity.",
  "How can I 10x my progress on this project?",
  "Give me a mindset for today."
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSendMessage }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
      <div className="max-w-2xl">
        <h2 className="text-4xl font-bold text-gray-200 mb-2">AI Mentor</h2>
        <p className="mb-8">Stop wasting time. Ask what matters. Get a direct answer.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSendMessage(prompt)}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-left hover:bg-gray-800 transition duration-200"
            >
              <p className="text-sm text-gray-300">{prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
