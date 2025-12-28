
import React, { useState, useEffect, useRef } from 'react';
import { View, Post } from '../types';
import { GoogleGenAI } from "@google/genai";

interface CreatePostViewProps {
  onNavigate: (view: View) => void;
  onAddPost: (post: Post) => void;
}

interface AIFilter {
  id: string;
  name: string;
  prompt: string;
  icon: string;
}

const AI_FILTERS: AIFilter[] = [
  { id: 'oil', name: 'Pintura', prompt: 'Oil painting style, textured canvas, vibrant colors.', icon: 'brush' },
  { id: 'cyber', name: 'Cyberpunk', prompt: 'Neon lights, futuristic city vibes, pink and blue tones.', icon: 'electric_bolt' },
  { id: 'retro', name: 'Retro', prompt: '80s vintage film aesthetic, warm tones, light leaks.', icon: 'camera_roll' },
];

const CreatePostView: React.FC<CreatePostViewProps> = ({ onNavigate, onAddPost }) => {
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [caption, setCaption] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isCameraActive) startCamera();
    return () => stopCamera();
  }, [isCameraActive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setCurrentImage('https://picsum.photos/800/800?random=400');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setCurrentImage(canvas.toDataURL('image/jpeg'));
      setIsCameraActive(false);
    }
  };

  const handlePublish = () => {
    if (!currentImage) return;
    const newPost: Post = {
      id: `p${Date.now()}`,
      user: 'Sarah Jenkins',
      avatar: 'https://picsum.photos/200?random=200',
      location: 'Nova York, NY',
      image: currentImage,
      likes: 0,
      caption: caption,
      time: 'AGORA',
      isMine: true,
      type: 'image'
    };
    onAddPost(newPost);
    onNavigate(View.FEED);
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark overflow-hidden">
      <header className="flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-surface-dark/90 ios-blur border-b border-border-light dark:border-border-dark z-50">
        <button onClick={() => onNavigate(View.FEED)} className="p-2 text-gray-400"><span className="material-icons-round">close</span></button>
        <span className="font-bold font-display text-[10px] tracking-[0.2em] dark:text-white">NOVA PUBLICAÇÃO</span>
        <button onClick={handlePublish} disabled={!currentImage} className="font-bold text-accent uppercase text-[10px] tracking-widest disabled:opacity-30">Publicar</button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <div className="relative aspect-square w-full bg-black overflow-hidden shadow-2xl">
          {isCameraActive ? (
            <div className="w-full h-full relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute inset-x-0 bottom-8 flex justify-center">
                <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center active:scale-90 transition-all">
                  <div className="w-16 h-16 bg-white rounded-full" />
                </button>
              </div>
            </div>
          ) : (
            <img src={currentImage || ''} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
          )}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center backdrop-blur-md">
              <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-white font-display text-[9px] tracking-widest animate-pulse">Refinando Imagem...</p>
            </div>
          )}
        </div>

        {!isCameraActive && currentImage && (
          <div className="p-6 space-y-8 animate-in slide-in-from-bottom duration-500">
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Legenda</label>
              <textarea 
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Escreva algo inspirador..."
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm dark:text-white placeholder-gray-500 resize-none h-24"
              />
            </div>
            
            <div>
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-4">Estilos Inteligentes (AI)</label>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {AI_FILTERS.map(f => (
                  <button key={f.id} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-surface-dark flex items-center justify-center text-accent group-hover:scale-110 transition-all border border-transparent group-hover:border-accent">
                      <span className="material-icons-round">{f.icon}</span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CreatePostView;
