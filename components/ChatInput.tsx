import React from 'react';

interface ChatInputProps {
  text: string;
  setText: (text: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  text, 
  setText, 
  onSendMessage, 
  isLoading, 
  isListening, 
  onToggleListening,
  placeholder = "Ask a question. Get a direct answer." 
}) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <div className="relative flex-grow">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={isListening ? "Listening..." : placeholder}
          disabled={isLoading}
          className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-5 pr-14 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition duration-300 disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={onToggleListening}
          disabled={isLoading}
          className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full focus:outline-none transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening 
              ? 'text-red-500 animate-pulse' 
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
          aria-label={isListening ? "Stop listening" : "Start listening"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </form>
  );
};