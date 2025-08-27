
import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Basic markdown-to-HTML conversion for bolding
  const formatText = (text: string) => {
    // Replace **text** with <strong>text</strong>
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace newlines with <br> tags for rendering
    return bolded.replace(/\n/g, '<br />');
  };

  const formattedText = { __html: formatText(message.text) };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`rounded-lg px-4 py-3 max-w-md md:max-w-lg lg:max-w-2xl shadow-md ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        <p className="text-sm" dangerouslySetInnerHTML={formattedText}></p>
      </div>
    </div>
  );
};
