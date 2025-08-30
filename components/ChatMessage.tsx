import React from 'react';
import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

const AiIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  </div>
);

const UserIcon = () => (
  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Enhanced markdown-to-HTML conversion for bolding and code blocks.
  const formatText = (text: string) => {
    // Escape basic HTML to prevent accidental injection.
    let safeText = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Process multiline code blocks ``` ... ```
    safeText = safeText.replace(/```(?:bash|sh|text|)\n([\s\S]*?)\n```/g, (match, code) => {
        // The code inside has already had its < and > escaped.
        return `<pre class="bg-gray-900 p-3 rounded-md my-2 text-sm text-gray-300 overflow-x-auto font-mono"><code>${code.trim()}</code></pre>`;
    });

    // Process bold **text**
    safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Process newlines that are NOT inside a <pre> block
    const parts = safeText.split(/(<pre[\s\S]*?<\/pre>)/g);
    const processedParts = parts.map(part => {
        if (part.startsWith('<pre')) {
            return part;
        }
        return part.replace(/\n/g, '<br />');
    });

    return processedParts.join('');
  };

  const formattedText = { __html: formatText(message.text) };

  return (
    <div className={`flex items-start gap-3 animate-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && <AiIcon />}
      <div
        className={`rounded-lg px-4 py-3 max-w-md md:max-w-lg lg:max-w-2xl shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
            : 'bg-gray-800 text-gray-300'
        }`}
      >
        <div className="text-sm leading-relaxed" dangerouslySetInnerHTML={formattedText}></div>
      </div>
       {isUser && <UserIcon />}
    </div>
  );
};