
import React from 'react';

interface HeaderProps {
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isTtsEnabled, onToggleTts, onSignOut }) => {
  const VolumeOnIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );

  const VolumeOffIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 9l4 4m0-4l-4 4" />
    </svg>
  );

  const SignOutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  return (
    <div className="p-4 bg-gray-950/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between sticky top-0 z-10">
      <div className="w-20 flex justify-start">
        <button 
          onClick={onSignOut} 
          className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1 flex items-center gap-2"
          aria-label="Sign Out"
        >
          {SignOutIcon}
        </button>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-100 tracking-wider">
          AI MENTOR <span className="text-blue-500">[ELON MODE]</span>
        </h1>
        <p className="text-xs text-gray-500 font-medium">First principles thinking. Maximum output.</p>
      </div>
      <div className="w-20 flex justify-end">
        <button 
          onClick={onToggleTts} 
          className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
          aria-label={isTtsEnabled ? "Disable text-to-speech" : "Enable text-to-speech"}
        >
          {isTtsEnabled ? VolumeOnIcon : VolumeOffIcon}
        </button>
      </div>
    </div>
  );
};
