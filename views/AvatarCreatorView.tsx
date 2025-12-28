
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AvatarCreatorViewProps {
  onBack: () => void;
}

const LOADING_MESSAGES = [
  "Iniciando motores de criatividade...",
  "Esculpindo pixels com inteligência artificial...",
  "Dando vida ao seu avatar digital...",
  "Quase lá! Ajustando os detalhes finais...",
  "Renderizando seu novo eu em 1080p..."
];

const AvatarCreatorView: React.FC<AvatarCreatorViewProps> = ({ onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);

  const checkApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      setNeedsApiKey(true);
      return false;
    }
    return true;
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    await window.aistudio.openSelectKey();
    setNeedsApiKey(false);
  };

  const generateAvatar = async () => {
    if (!prompt.trim()) return;
    
    const hasKey = await checkApiKey();
    if (!hasKey) return;

    setIsGenerating(true);
    setVideoUrl(null);

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 4000);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A high-quality 3D animated emoji/avatar video: ${prompt}. Cinematic lighting, vibrant colors, expressive emotions.`,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '1:1'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error("Video generation failed:", error);
      if (error.message?.includes("Requested entity was not found")) {
        setNeedsApiKey(true);
      } else {
        alert("Erro ao gerar avatar. Tente novamente.");
      }
    } finally {
      clearInterval(messageInterval);
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background-dark text-white p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pt-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400">
          <span className="material-icons-round text-2xl">close</span>
        </button>
        <h1 className="text-xl font-bold font-display tracking-tight">AI Avatar Creator</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Preview Area */}
        <div className="aspect-square w-full rounded-3xl bg-surface-dark border border-border-dark overflow-hidden relative shadow-2xl mb-8">
          {videoUrl ? (
            <video 
              src={videoUrl} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-sm">
              <div className="w-20 h-20 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
              <p className="text-accent font-bold animate-pulse text-lg">{loadingMessage}</p>
              <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">A geração de vídeo pode levar alguns minutos</p>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40">
              <span className="material-icons-round text-6xl mb-4">face_retouching_natural</span>
              <p className="text-sm font-medium">Descreva seu novo avatar abaixo</p>
            </div>
          )}
        </div>

        {/* Input Area */}
        {needsApiKey ? (
          <div className="bg-accent/10 border border-accent/20 rounded-2xl p-6 text-center">
            <h3 className="font-bold mb-2">Chave de API necessária</h3>
            <p className="text-xs text-gray-400 mb-6">
              Para usar o gerador de vídeo Veo, você precisa selecionar uma API Key de um projeto pago.
              <br/><a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-accent underline">Saiba mais sobre faturamento</a>
            </p>
            <button 
              onClick={handleSelectKey}
              className="w-full py-4 bg-accent text-white font-bold rounded-xl shadow-lg active:scale-95 transition"
            >
              Selecionar API Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Um pequeno robô astronauta flutuando no espaço, estilo Pixar, sorrindo e dando tchau..."
                className="w-full bg-surface-dark border border-border-dark rounded-2xl p-4 text-sm focus:ring-accent focus:border-accent min-h-[120px] resize-none"
                disabled={isGenerating}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Veo 3.1 AI</span>
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
              </div>
            </div>

            <button 
              onClick={generateAvatar}
              disabled={isGenerating || !prompt.trim()}
              className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-accent/20
                ${isGenerating || !prompt.trim() 
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                  : 'bg-accent text-white hover:opacity-90 active:scale-95'}`}
            >
              {isGenerating ? (
                <>Processando...</>
              ) : (
                <>
                  <span className="material-icons-round">magic_button</span>
                  Gerar Avatar em Vídeo
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-gray-500 px-6">
              O vídeo gerado pode ser usado como seu avatar animado ou compartilhado no chat como um emoji personalizado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarCreatorView;
