
import React from 'react';
import { View } from '../types';

interface BottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onOpenMenu?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate, onOpenMenu }) => {
  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/90 dark:bg-surface-dark/90 ios-blur border-t border-border-light dark:border-border-dark px-2 pb-6 pt-2 z-50 flex justify-around items-center">
      <button 
        onClick={() => onNavigate(View.FEED)}
        className={`p-2 transition-colors ${currentView === View.FEED ? 'text-accent' : 'text-gray-400'}`}
      >
        <span className="material-icons-round text-2xl">home</span>
      </button>
      
      <button 
        onClick={() => onNavigate(View.CHAT)}
        className={`p-2 transition-colors ${currentView === View.CHAT ? 'text-accent' : 'text-gray-400'}`}
      >
        <span className="material-icons-round text-2xl">chat_bubble_outline</span>
      </button>

      <button 
        onClick={() => onOpenMenu ? onOpenMenu() : onNavigate(View.CREATE)}
        className="p-2 transition-transform active:scale-95"
      >
        <div className="bg-primary dark:bg-white text-white dark:text-black rounded-xl px-4 py-1.5 shadow-lg flex items-center justify-center">
          <span className="material-icons-round text-xl font-bold">add</span>
        </div>
      </button>

      <button 
        onClick={() => onNavigate(View.PROFILE)}
        className={`p-2 transition-colors ${currentView === View.PROFILE ? 'text-accent' : 'text-gray-400'}`}
      >
        <span className="material-icons-round text-2xl">person_outline</span>
      </button>

      <button 
        onClick={() => onNavigate(View.SETTINGS)}
        className={`p-2 transition-colors ${currentView === View.SETTINGS ? 'text-accent' : 'text-gray-400'}`}
      >
        <span className="material-icons-round text-2xl">settings</span>
      </button>
    </nav>
  );
};

export default BottomNav;
