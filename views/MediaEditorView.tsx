
import React, { useState } from 'react';

interface MediaEditorViewProps {
  onBack: () => void;
}

const MediaEditorView: React.FC<MediaEditorViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video'>('audio');
  const [isProcessing, setIsProcessing] = useState(false);

  const mockMusic = [
    { id: 1, title: 'Summer Vibes', artist: 'AI Beats', duration: '2:45' },
    { id: 2, title: 'Neon Night', artist: 'Cyber Soul', duration: '3:12' },
    { id: 3, title: 'Calm River', artist: 'Zen Master', duration: '5:20' }
  ];

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-surface-dark/90 ios-blur border-b border-border-light dark:border-border-dark z-50">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
          <span className="material-icons-round">arrow_back</span>
        </button>
        <span className="font-bold text-lg dark:text-white font-display">Estúdio L2M</span>
        <div className="w-10" />
      </header>

      <div className="flex p-4 gap-2">
        <button 
          onClick={() => setActiveTab('audio')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'audio' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-surface-dark text-gray-500'}`}
        >
          Áudio & Música
        </button>
        <button 
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-all ${activeTab === 'video' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-surface-dark text-gray-500'}`}
        >
          Vídeos & GIFs
        </button>
      </div>

      <main className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {activeTab === 'audio' ? (
          <div className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 flex flex-col items-center text-center">
              <span className="material-icons-round text-accent text-4xl mb-4">cloud_upload</span>
              <h3 className="font-bold dark:text-white">Importar Música</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">Selecione um arquivo MP3 ou WAV para editar</p>
              <button className="bg-accent text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg active:scale-95 transition">
                ESCOLHER ARQUIVO
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sua Biblioteca</h3>
              {mockMusic.map(track => (
                <div key={track.id} className="bg-white dark:bg-surface-dark p-3 rounded-2xl flex items-center gap-3 shadow-sm border border-transparent hover:border-accent transition-colors cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-background-dark flex items-center justify-center text-accent">
                    <span className="material-icons-round">music_note</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold dark:text-white">{track.title}</h4>
                    <p className="text-[10px] text-gray-500">{track.artist}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-accent"><span className="material-icons-round text-sm">content_cut</span></button>
                    <button className="p-2 text-gray-400 hover:text-accent"><span className="material-icons-round text-sm">download</span></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl text-white shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-icons-round">auto_awesome</span>
                <span className="font-bold text-sm">Mixagem AI</span>
              </div>
              <p className="text-[10px] opacity-80 mb-4">Deixe nossa AI criar uma trilha sonora única baseada no seu humor atual.</p>
              <button className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition">
                GERAR MIXAGEM AI
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="aspect-video bg-gray-100 dark:bg-surface-dark rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700">
              <span className="material-icons-round text-4xl text-gray-400 mb-2">movie_filter</span>
              <p className="text-xs font-bold text-gray-500">Criar GIF com Música</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button className="aspect-square bg-white dark:bg-surface-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-border-light dark:border-border-dark active:scale-95 transition">
                <span className="material-icons-round text-accent text-2xl mb-2">auto_videocam</span>
                <span className="text-[10px] font-bold dark:text-white uppercase tracking-wider">Video AI</span>
              </button>
              <button className="aspect-square bg-white dark:bg-surface-dark rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-border-light dark:border-border-dark active:scale-95 transition">
                <span className="material-icons-round text-accent text-2xl mb-2">gif_box</span>
                <span className="text-[10px] font-bold dark:text-white uppercase tracking-wider">Música + GIF</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MediaEditorView;
