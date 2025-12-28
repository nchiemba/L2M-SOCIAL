
import React, { useState, useRef, useEffect } from 'react';
import { View } from '../types';

interface Message {
  id: number;
  type: 'sent' | 'received';
  text?: string;
  media?: 'playlist' | 'audio' | 'location';
  title?: string;
  subtitle?: string;
  time: string;
  duration?: string;
}

interface ChatViewProps {
  onNavigate: (view: View, params?: any) => void;
  partner: { user: string, avatar: string };
}

const ChatView: React.FC<ChatViewProps> = ({ onNavigate, partner }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, type: 'received', text: `Oi! Viu a nova playlist que lançaram no L2M?`, time: '10:23' },
    { id: 2, type: 'sent', text: 'Ainda não! É boa? Me manda o link?', time: '10:24' },
    { id: 3, type: 'received', media: 'playlist', title: 'Neon Nights', subtitle: 'Synthwave Mix Vol. 2', time: '10:25' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = (text?: string, media?: Message['media'], extra?: any) => {
    const content = text || inputText;
    if (!content.trim() && !media) return;
    
    const newMessage: Message = { 
      id: Date.now(), 
      type: 'sent', 
      text: content, 
      media,
      ...extra,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const sendLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        handleSend(`Minha localização: ${mapsUrl}`, 'location');
      }, (err) => {
        alert("Erro ao obter localização. Verifique as permissões.");
      });
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const finalTime = formatTime(recordingTime);
        handleSend("", 'audio', { duration: finalTime });
        stream.getTracks().forEach(t => t.stop());
      };
    } catch (err) {
      alert("Erro ao acessar microfone. Verifique as permissões de áudio.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleAction = () => {
    if (inputText.trim()) {
      handleSend();
    } else if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark pt-12 pb-6">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-white/90 dark:bg-surface-dark/90 ios-blur z-20 shadow-sm border-b border-border-light dark:border-border-dark fixed top-0 w-full max-w-md">
        <button onClick={() => onNavigate(View.FEED)} className="p-2 -ml-2 text-accent">
          <span className="material-icons-round text-2xl">arrow_back_ios_new</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <div className="relative">
            <img src={partner.avatar} className="w-8 h-8 rounded-full object-cover" alt="Avatar" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-surface-dark rounded-full"></div>
          </div>
          <h2 className="text-sm font-bold dark:text-white leading-none mt-1">{partner.user}</h2>
          <span className="text-[9px] text-gray-400">Online agora</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onNavigate(View.CALL, { mode: 'voice', user: partner.user })} className="p-2 text-accent transition-transform active:scale-90"><span className="material-icons-round text-2xl">call</span></button>
          <button onClick={() => onNavigate(View.CALL, { mode: 'video', user: partner.user })} className="p-2 text-accent transition-transform active:scale-90"><span className="material-icons-round text-2xl">videocam</span></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar pt-20">
        <div className="flex justify-center mb-2">
          <span className="text-[10px] font-bold text-gray-400 bg-black/5 dark:bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">Hoje</span>
        </div>
        
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.type === 'sent' ? 'flex-row-reverse' : ''}`}>
            {msg.type === 'received' && <img src={partner.avatar} className="w-8 h-8 rounded-full mb-1 object-cover" alt="Avatar" />}
            <div className={`max-w-[75%] p-3.5 rounded-2xl shadow-sm ${msg.type === 'sent' ? 'bg-accent text-white rounded-br-none' : 'bg-white dark:bg-surface-dark dark:text-white rounded-bl-none'}`}>
              
              {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
              
              {msg.media === 'playlist' && (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center relative overflow-hidden">
                    <img src="https://picsum.photos/100?random=50" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Cover" />
                    <span className="material-icons-round text-white z-10">play_arrow</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold truncate">{msg.title}</h4>
                    <p className="text-[10px] text-gray-400 truncate">{msg.subtitle}</p>
                  </div>
                </div>
              )}

              {msg.media === 'audio' && (
                <div className="flex items-center gap-3 min-w-[200px]">
                  <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="material-icons-round">play_arrow</span>
                  </button>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-6 flex items-center gap-0.5">
                      {Array.from({length: 15}).map((_, i) => (
                        <div key={i} className="flex-1 bg-white/40 rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }}></div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-[10px] opacity-70 font-bold">
                      <span>{msg.duration}</span>
                      <span>{msg.time}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-2 pb-6 bg-white dark:bg-surface-dark border-t border-border-light dark:border-border-dark transition-all duration-300">
        
        {!isRecording && (
          <div className="flex items-center gap-2 mb-2 px-2 overflow-x-auto no-scrollbar py-1">
            <button onClick={() => onNavigate(View.CREATE)} className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-accent flex items-center justify-center transition-all active:scale-90"><span className="material-icons-round text-lg">camera_alt</span></button>
            <button onClick={() => onNavigate(View.MEDIA_EDITOR)} className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-accent flex items-center justify-center transition-all active:scale-90"><span className="material-icons-round text-lg">music_note</span></button>
            <button onClick={sendLocation} className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-accent flex items-center justify-center transition-all active:scale-90"><span className="material-icons-round text-lg">location_on</span></button>
            <button onClick={() => onNavigate(View.AVATAR_CREATOR)} className="flex-shrink-0 w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 text-gray-500 hover:text-accent flex items-center justify-center transition-all active:scale-90"><span className="material-icons-round text-lg">auto_awesome</span></button>
          </div>
        )}

        <div className="flex items-end gap-2 px-2">
          <div className={`flex-1 flex items-center px-4 py-2.5 rounded-3xl transition-all duration-300 ${isRecording ? 'bg-red-50 dark:bg-red-900/20 ring-1 ring-red-200' : 'bg-black/5 dark:bg-white/5'}`}>
            {isRecording ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm font-bold text-red-500">{formatTime(recordingTime)}</span>
                <span className="text-xs text-gray-400 animate-pulse flex-1">Gravando mensagem de voz...</span>
                <button onClick={stopRecording} className="text-red-500 font-bold text-xs uppercase tracking-widest">Cancelar</button>
              </div>
            ) : (
              <>
                <input 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-transparent border-none text-sm p-0 focus:ring-0 placeholder-gray-400 dark:text-white" 
                  placeholder="Mensagem..." 
                />
                <button onClick={() => onNavigate(View.AVATAR_CREATOR)} className="ml-2 text-gray-400 hover:text-yellow-500 transition-colors">
                  <span className="material-icons-round text-xl">sentiment_satisfied_alt</span>
                </button>
              </>
            )}
          </div>

          <button 
            onClick={handleAction}
            className={`p-3 rounded-full text-white shadow-lg active:scale-90 transition-all flex items-center justify-center ${isRecording ? 'bg-red-500 animate-bounce' : inputText.trim() ? 'bg-accent' : 'bg-accent'}`}
            onMouseDown={() => !inputText.trim() && !isRecording && startRecording()}
            onMouseUp={() => !inputText.trim() && isRecording && stopRecording()}
            onTouchStart={() => !inputText.trim() && !isRecording && startRecording()}
            onTouchEnd={() => !inputText.trim() && isRecording && stopRecording()}
          >
            <span className="material-icons-round text-xl">
              {inputText.trim() ? 'send' : isRecording ? 'stop' : 'mic'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
