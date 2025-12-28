
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';

interface CallViewProps {
  mode: 'voice' | 'video';
  user: string;
  onEnd: () => void;
}

const CallView: React.FC<CallViewProps> = ({ mode, user, onEnd }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(mode === 'voice');
  const [status, setStatus] = useState('Conectando...');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let frameInterval: number | null = null;

    const startCall = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: true, 
          video: mode === 'video' 
        });

        if (videoRef.current && mode === 'video') {
          videoRef.current.srcObject = stream;
        }

        const sessionPromise = ai.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: () => {
              setStatus('Conectado');
              const source = audioContextRef.current!.createMediaStreamSource(stream!);
              const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
              
              scriptProcessor.onaudioprocess = (e) => {
                if (isMuted) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(audioContextRef.current!.destination);

              if (mode === 'video' && videoRef.current && canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                frameInterval = window.setInterval(() => {
                  if (isCameraOff) return;
                  const v = videoRef.current!;
                  canvasRef.current!.width = 320;
                  canvasRef.current!.height = 240;
                  ctx?.drawImage(v, 0, 0, 320, 240);
                  canvasRef.current!.toBlob(async (blob) => {
                    if (blob) {
                      const base64 = await blobToBase64(blob);
                      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    }
                  }, 'image/jpeg', 0.5);
                }, 1000);
              }
            },
            onmessage: async (message: LiveServerMessage) => {
              const audioBase64 = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
              if (audioBase64 && outputAudioContextRef.current) {
                const ctx = outputAudioContextRef.current;
                nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
                const source = ctx.createBufferSource();
                source.buffer = buffer;
                source.connect(ctx.destination);
                source.addEventListener('ended', () => sourcesRef.current.delete(source));
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += buffer.duration;
                sourcesRef.current.add(source);
              }

              if (message.serverContent?.interrupted) {
                sourcesRef.current.forEach(s => s.stop());
                sourcesRef.current.clear();
                nextStartTimeRef.current = 0;
              }
            },
            onerror: (e) => {
              console.error('Live API Error:', e);
              setStatus('Erro na conexão');
            },
            onclose: () => {
              setStatus('Chamada encerrada');
              setTimeout(onEnd, 1500);
            }
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
            systemInstruction: `Você é ${user} em uma chamada de vídeo/voz no app L2M Social. Seja amigável e natural.`
          }
        });

        sessionRef.current = await sessionPromise;

      } catch (err) {
        console.error('Call failed:', err);
        setStatus('Falha ao iniciar');
      }
    };

    startCall();

    return () => {
      stream?.getTracks().forEach(t => t.stop());
      if (frameInterval) clearInterval(frameInterval);
      if (sessionRef.current) sessionRef.current.close();
      audioContextRef.current?.close();
      outputAudioContextRef.current?.close();
    };
  }, []);

  // Utility helpers
  const createBlob = (data: Float32Array): Blob => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, rate: number, channels: number) => {
    const int16 = new Int16Array(data.buffer);
    const frameCount = int16.length / channels;
    const buffer = ctx.createBuffer(channels, frameCount, rate);
    for (let c = 0; c < channels; c++) {
      const channelData = buffer.getChannelData(c);
      for (let i = 0; i < frameCount; i++) channelData[i] = int16[i * channels + c] / 32768;
    }
    return buffer;
  };

  const blobToBase64 = (blob: BlobPart): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(new window.Blob([blob]));
    });
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col text-white">
      {/* Background/Video Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        {mode === 'video' && !isCameraOff ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted 
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-white/20 p-1 mb-4">
              <img src="https://picsum.photos/200?random=2" className="w-full h-full rounded-full object-cover" alt="User" />
            </div>
            <h1 className="text-2xl font-bold">{user}</h1>
            <p className="text-gray-400 mt-2 tracking-widest uppercase text-xs">{status}</p>
          </div>
        )}

        {/* Small Preview for local video if in video mode */}
        {mode === 'video' && !isCameraOff && (
          <div className="absolute top-12 right-6 w-24 h-36 rounded-xl bg-gray-800 border-2 border-white/20 overflow-hidden shadow-2xl">
             <div className="w-full h-full bg-accent/20 flex items-center justify-center">
                <span className="material-icons-round text-accent animate-pulse">auto_awesome</span>
             </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-10 pb-16 flex flex-col items-center gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-black' : 'bg-white/10 text-white backdrop-blur-xl'}`}
          >
            <span className="material-icons-round text-2xl">{isMuted ? 'mic_off' : 'mic'}</span>
          </button>

          <button 
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <span className="material-icons-round text-3xl">call_end</span>
          </button>

          <button 
            onClick={() => setIsCameraOff(!isCameraOff)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isCameraOff ? 'bg-white text-black' : 'bg-white/10 text-white backdrop-blur-xl'}`}
          >
            <span className="material-icons-round text-2xl">{isCameraOff ? 'videocam_off' : 'videocam'}</span>
          </button>
        </div>

        <div className="flex items-center gap-10 opacity-60">
          <button className="flex flex-col items-center gap-1">
            <span className="material-icons-round">volume_up</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Alto-falante</span>
          </button>
          <button className="flex flex-col items-center gap-1">
            <span className="material-icons-round">keyboard</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Teclado</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallView;
