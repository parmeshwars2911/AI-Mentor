import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Message } from './types';
import { createChatSession } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';

// Fix: Add types for the Web Speech API to resolve "Cannot find name 'SpeechRecognition'".
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

// Polyfill for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('tts-enabled');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setChat(createChatSession());
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition: SpeechRecognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      // Fix: Use strongly-typed event for better type safety.
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      // Fix: Use strongly-typed event for better type safety.
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setInputText(transcript);
      };
      speechRecognition.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('tts-enabled', JSON.stringify(isTtsEnabled));
    }
  }, [isTtsEnabled]);

  const handleToggleListening = () => {
    if (!speechRecognition.current) {
      alert("Voice recognition is not supported in your browser.");
      return;
    }
    if (isListening) {
      speechRecognition.current.stop();
    } else {
      setInputText('');
      speechRecognition.current.start();
    }
  };
  
  const toggleTts = () => {
    if (isTtsEnabled && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setIsTtsEnabled(prev => !prev);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chat || isLoading || !text.trim()) return;

    setIsLoading(true);
    setInputText('');
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai' }]);

    try {
      const stream = await chat.sendMessageStream({ message: text });
      
      let fullResponse = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if(chunkText) {
          fullResponse += chunkText;
          setMessages(prev =>
            prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, text: fullResponse } : msg
            )
          );
        }
      }

      if (isTtsEnabled && fullResponse) {
          if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fullResponse);
          window.speechSynthesis.speak(utterance);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = "Error: Could not get a response. Check your API key and network.";
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: errorMessage } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading, isTtsEnabled]);

  return (
    <div className="bg-black text-gray-200 h-screen flex flex-col font-mono">
      <Header isTtsEnabled={isTtsEnabled} onToggleTts={toggleTts} />
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 ? (
          <WelcomeScreen onSendMessage={(prompt) => handleSendMessage(prompt)} />
        ) : (
          messages.map(msg => <ChatMessage key={msg.id} message={msg} />)
        )}
         {isLoading && messages.length > 0 && messages[messages.length - 1]?.sender === 'ai' && !messages[messages.length - 1]?.text && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-lg p-3 max-w-lg animate-pulse">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                </div>
              </div>
            </div>
          )}
      </div>
      <div className="p-4 bg-black border-t border-gray-800">
        <ChatInput 
          text={inputText} 
          setText={setInputText}
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          isListening={isListening}
          onToggleListening={handleToggleListening}
        />
      </div>
    </div>
  );
};

export default App;
