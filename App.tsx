
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { Message, ApiContent } from './types';
import { getSystemInstruction, generateChatResponse, checkGeminiServiceStatus } from './services/geminiService';
import { addLog, getLogs } from './services/supabaseService';
import { signOut, onAuthStateChange } from './services/userService';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { Header } from './components/Header';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Auth } from './components/Auth';
import { logSafe } from './services/safeLogger';

type AppState = 'initializing' | 'ready' | 'error';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiReplying, setIsAiReplying] = useState<boolean>(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState('Waiting for user...');
  const [appState, setAppState] = useState<AppState>('initializing');
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const [isTtsEnabled, setIsTtsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('tts-enabled');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  
  const handleSignOut = async () => {
    await signOut();
    // The onAuthStateChange listener will handle setting the session to null.
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isAiReplying) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    const aiPlaceholder: Message = { id: (Date.now() + 1).toString(), text: '', sender: 'ai' };

    const historyForApi = [...messages, userMessage];

    setMessages([...historyForApi, aiPlaceholder]);
    setInputText('');
    setIsAiReplying(true);
    await addLog(userMessage);

    try {
      const systemInstruction = getSystemInstruction();
      const apiHistory: ApiContent[] = historyForApi
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
      
      const fullResponse = await generateChatResponse(apiHistory, systemInstruction);
      const finalAiMessage: Message = { id: aiPlaceholder.id, text: fullResponse, sender: 'ai' };

      setMessages(prev => prev.map(msg => msg.id === aiPlaceholder.id ? finalAiMessage : msg));
      await addLog(finalAiMessage);

      if (isTtsEnabled && fullResponse) {
          if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(fullResponse);
          window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      logSafe("--- [CHAT ERROR] Gemini API/Supabase Error Caught in handleSendMessage ---", error);

      const rawErrorMessage = (error instanceof Error ? error.message : String(error)).toLowerCase();
      let userFacingErrorText: string;

      if (rawErrorMessage.includes('api key not valid') || rawErrorMessage.includes('invalid api key')) {
        userFacingErrorText = `**[API Key Invalid]**\n\nThe provided API key is not valid. Please verify that the \`API_KEY\` environment variable is set correctly.`;
      } else if (rawErrorMessage.includes('quota')) {
        userFacingErrorText = `**[API Quota Exceeded]**\n\nThe API key has reached its free daily usage limit. Please wait 24 hours for the quota to reset.`;
      } else if (rawErrorMessage.includes('safety') || rawErrorMessage.includes('blocked')) {
         userFacingErrorText = `**[Content Moderation]**\n\nThe AI's response was blocked due to safety settings. Please try rephrasing your message.`;
      } else if (rawErrorMessage.includes('fetch') || rawErrorMessage.includes('network') || rawErrorMessage.includes('supabase')) {
         userFacingErrorText = `**[Network Error]**\n\nCould not connect to the backend service. Please check your network and try again.`;
      } else {
        userFacingErrorText = `**[CRITICAL: AI Service Failure]**\n\nThe request to the AI service failed for an unknown reason. Please check the console for details.`;
      }
      
      const errorMessage: Message = { 
        id: aiPlaceholder.id, 
        text: `${userFacingErrorText}\n\n**Error Details:** \`${rawErrorMessage}\``,
        sender: 'ai' 
      };
      setMessages(prev => prev.map(msg => msg.id === aiPlaceholder.id ? errorMessage : msg));
      
      const errorLogObject: Message = {
        id: aiPlaceholder.id,
        sender: 'ai',
        text: `[HANDLER_ERROR] ${userFacingErrorText}`,
      };
      await addLog(errorLogObject);

    } finally {
      setIsAiReplying(false);
    }
  }, [messages, isAiReplying, isTtsEnabled]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        logSafe('Speech recognition error:', event.error);
        setIsListening(false);
      };
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };
      
      speechRecognition.current = recognition;
    }
  }, [handleSendMessage]);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('tts-enabled', JSON.stringify(isTtsEnabled));
  }, [isTtsEnabled]);

  // Main effect to handle authentication state and app initialization
  useEffect(() => {
    const { data: authListener } = onAuthStateChange((_event, session) => {
      setSession(session);
      
      const initializeApp = async () => {
        try {
          if (session) {
            setAppState('initializing');
            setAppStatus('Loading History...');
            const history = await getLogs();
            setMessages(history);
            
            setAppStatus('Checking AI Service...');
            const geminiStatus = await checkGeminiServiceStatus();
            if (!geminiStatus.isReady) {
              throw new Error(`AI Service Error: ${geminiStatus.error}`);
            }
            setAppState('ready');
          }
        } catch (error) {
          logSafe("Initialization failed", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          setInitializationError(`Initialization Failed: ${errorMessage}`);
          setAppState('error');
        }
      };

      initializeApp();
    });

    return () => {
      authListener.subscription.unsubscribe();
       if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      speechRecognition.current?.stop();
    } else {
      speechRecognition.current?.start();
    }
  };

  if (!session) {
    return <Auth />;
  }

  if (appState === 'error') {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-gray-200 items-center justify-center p-8 text-center">
        <div className="max-w-2xl bg-gray-900 border border-red-500/30 p-8 rounded-lg shadow-2xl shadow-red-500/10">
          <h1 className="text-2xl font-bold text-red-400 mb-4">System Critical Error</h1>
          <p className="text-gray-400 mb-2">The application failed to initialize. This is usually caused by a network issue or an incorrect configuration.</p>
          <p className="text-sm font-mono bg-gray-800 p-4 rounded-md text-red-300">{initializationError}</p>
        </div>
      </div>
    );
  }

  if (appState === 'initializing') {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-gray-200 items-center justify-center p-8 text-center">
        <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">{appStatus}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200">
      <Header 
        isTtsEnabled={isTtsEnabled} 
        onToggleTts={() => setIsTtsEnabled(prev => !prev)} 
        onSignOut={handleSignOut}
      />
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && <WelcomeScreen onSendMessage={handleSendMessage} />}
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isAiReplying && (
          <div className="flex justify-center items-center py-4">
             <div className="w-10 h-10 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="p-4 md:p-6 bg-gray-950/80 backdrop-blur-sm border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
            <ChatInput 
                text={inputText} 
                setText={setInputText} 
                onSendMessage={handleSendMessage}
                isLoading={isAiReplying}
                isListening={isListening}
                onToggleListening={toggleListening}
                placeholder="Ask a question. Get a direct answer."
            />
        </div>
      </div>
    </div>
  );
};

export default App;
