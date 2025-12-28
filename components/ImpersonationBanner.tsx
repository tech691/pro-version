
import React from 'react';
import { User } from '../types';

interface ImpersonationBannerProps {
  actingUser: User;
  currentUser: User;
  onStop: () => void;
}

const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ actingUser, currentUser, onStop }) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 z-50 flex items-center justify-between shadow-lg animate-pulse-subtle">
      <div className="flex items-center space-x-3 overflow-hidden">
        <span className="text-lg">🕵️‍♂️</span>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 truncate">
          <p className="font-bold text-sm md:text-base">Impersonation Mode</p>
          <span className="hidden md:inline opacity-50">|</span>
          <p className="text-xs md:text-sm truncate">
            Logged in as <span className="underline font-semibold">{actingUser.name}</span>, acting as <span className="underline font-semibold">{currentUser.name}</span>
          </p>
        </div>
      </div>
      <button
        onClick={onStop}
        className="bg-white text-amber-600 px-4 py-1.5 rounded-full text-xs md:text-sm font-bold hover:bg-amber-50 transition-colors shadow-sm whitespace-nowrap"
      >
        Exit Session
      </button>
    </div>
  );
};

export default ImpersonationBanner;
