import React from 'react';

interface ChatInputProps {
  text: string;
  setText: (text: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleListening: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ text, setText, onSendMessage, isLoading, isListening, onToggleListening }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isListening ? "Listening..." : "Ask a question. Get a direct answer."}
        disabled={isLoading}
        className="flex-grow bg-gray-900 border border-gray-700 rounded-full py-3 px-5 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 disabled:opacity-50"
        autoComplete="off"
      />
      <button
        type="button"
        onClick={onToggleListening}
        disabled={isLoading}
        className={`p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
          isListening 
            ? 'bg-red-600 text-white animate-pulse focus:ring-red-500' 
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-blue-500'
        }`}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </form>
  );
};