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
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 animate-fade-in">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
            <div className="w-20 h-20 mx-auto bg-gray-800/50 border border-gray-700 rounded-2xl flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-200 mb-2">AI Mentor [Elon Mode]</h2>
            <p className="text-gray-500">Stop wasting time. Ask what matters. Get a direct answer.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          {examplePrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSendMessage(prompt)}
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 text-left hover:bg-gray-800 hover:border-gray-700 transition-all duration-200 group"
            >
              <p className="font-medium text-gray-300 group-hover:text-white">{prompt}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};