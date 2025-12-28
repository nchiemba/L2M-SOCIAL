
import React from 'react';
import { View } from '../types';

interface ActionMenuProps {
  onClose: () => void;
  onNavigate: (view: View) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onClose, onNavigate }) => {
  const actions = [
    { id: 'post', label: 'Post', icon: 'add_a_photo', color: 'bg-black', view: View.CREATE },
    { id: 'video', label: 'AI Video', icon: 'videocam', color: 'bg-black', view: View.CREATE },
    { id: 'avatar', label: 'Avatar', icon: 'face_retouching_natural', color: 'bg-black', view: View.AVATAR_CREATOR },
    { id: 'music', label: 'Estúdio', icon: 'music_note', color: 'bg-black', view: View.MEDIA_EDITOR },
    { id: 'call', label: 'Chamada', icon: 'call', color: 'bg-black', view: View.CALL },
    { id: 'voice_msg', label: 'Voz', icon: 'mic', color: 'bg-black', view: View.CHAT },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-24">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-3xl p-8 grid grid-cols-3 gap-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center shadow-lg border-2 border-black"
        >
          <span className="material-icons-round text-black dark:text-white">close</span>
        </button>

        {actions.map(action => (
          <button 
            key={action.id}
            onClick={() => onNavigate(action.view)}
            className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
          >
            <div className={`${action.color} w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:bg-accent transition-all duration-300`}>
              <span className="material-icons-round text-2xl">{action.icon}</span>
            </div>
            <span className="text-[8px] font-bold text-black dark:text-white uppercase tracking-[0.2em] font-display text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ActionMenu;
