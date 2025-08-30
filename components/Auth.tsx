
import React, { useState } from 'react';
import { signIn, signUp } from '../services/userService';

type AuthMode = 'signIn' | 'signUp';

export const Auth: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = mode === 'signIn'
        ? await signIn({ email, password })
        : await signUp({ email, password });

      if (response.error) {
        setError(response.error.message);
      }
      // On success, the onAuthStateChange listener in App.tsx will handle the redirect.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signIn' ? 'signUp' : 'signIn');
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200 items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-gray-900 border border-gray-700 rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100">AI Mentor <span className="text-blue-500">[ELON MODE]</span></h1>
          <p className="text-gray-500 mt-2">{mode === 'signIn' ? 'Sign in to continue' : 'Create an account to begin'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-gray-900/50 border border-gray-800 shadow-2xl shadow-blue-500/10 rounded-lg p-8 space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/30 text-red-300 text-sm rounded-md p-3 text-center">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-bold rounded-md py-3 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-950 transition duration-300 disabled:bg-gray-700 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            )}
            {isLoading ? 'Processing...' : (mode === 'signIn' ? 'Sign In' : 'Sign Up')}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button onClick={toggleMode} className="text-sm text-gray-500 hover:text-blue-400 transition-colors">
            {mode === 'signIn' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};
