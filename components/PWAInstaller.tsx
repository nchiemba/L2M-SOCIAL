
import React, { useState, useEffect } from 'react';

const PWAInstaller: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [showManualInstructions, setShowManualInstructions] = useState(false);

  useEffect(() => {
    // Detect platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for beforeinstallprompt (Chrome/Android/Desktop)
    const handleBeforeInstallPrompt = (e: any) => {
      console.log('[PWA] Evento beforeinstallprompt capturado');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show popup after 2 seconds automatically
    const timer = setTimeout(() => {
      // Don't show if already installed (standalone mode)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
      if (!isStandalone) {
        console.log('[PWA] Iniciando popup de instalação automática');
        setShowPopup(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('[PWA] Clique no botão de instalação. Plataforma:', platform);
    
    if (deferredPrompt) {
      console.log('[PWA] Tentando instalação automática via Chrome API');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`[PWA] Escolha do usuário: ${outcome}`);
      setDeferredPrompt(null);
      setShowPopup(false);
    } else {
      console.log('[PWA] API de instalação indisponível. Mostrando instruções manuais.');
      setShowManualInstructions(true);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center px-4 pb-10 animate-in fade-in duration-500">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={() => setShowPopup(false)} 
      />
      
      <div className="relative w-full max-w-sm glass rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-700">
        <button 
          onClick={() => setShowPopup(false)}
          className="absolute top-4 right-4 text-gray-400 p-2"
        >
          <span className="material-icons-round text-xl">close</span>
        </button>

        {!showManualInstructions ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-black rounded-3xl shadow-xl flex items-center justify-center p-4 mb-6 ring-4 ring-white/20">
              <span className="text-xl font-bold tracking-tighter text-white font-display">L2M</span>
            </div>
            
            <h2 className="text-xl font-bold dark:text-white font-display tracking-tight mb-2">Instale o L2M</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 px-4">
              Tenha uma experiência nativa, rápida e suporte offline diretamente na sua tela de início.
            </p>

            <button 
              onClick={handleInstallClick}
              className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[10px] tracking-[0.2em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 uppercase font-display"
            >
              <span className="material-icons-round text-sm">download</span>
              Instalar Agora
            </button>
            <button 
              onClick={() => setShowPopup(false)}
              className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-accent transition-colors"
            >
              Agora não
            </button>
          </div>
        ) : (
          <div className="flex flex-col animate-in fade-in duration-300">
            <h2 className="text-lg font-bold dark:text-white font-display tracking-tight mb-6 text-center">Como Instalar</h2>
            
            <div className="space-y-6">
              {platform === 'ios' && (
                <>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-icons-round text-xl">ios_share</span>
                    </div>
                    <p className="text-[11px] font-medium dark:text-white leading-tight">
                      Toque no ícone de <span className="font-bold">Compartilhar</span> na barra do Safari.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
                    <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-icons-round text-xl">add_box</span>
                    </div>
                    <p className="text-[11px] font-medium dark:text-white leading-tight">
                      Role para baixo e selecione <span className="font-bold">"Adicionar à Tela de Início"</span>.
                    </p>
                  </div>
                </>
              )}

              {platform === 'android' && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-icons-round text-xl">more_vert</span>
                  </div>
                  <p className="text-[11px] font-medium dark:text-white leading-tight">
                    Toque nos <span className="font-bold">três pontos</span> no canto superior e selecione <span className="font-bold">"Instalar Aplicativo"</span>.
                  </p>
                </div>
              )}

              {platform === 'desktop' && (
                <div className="flex items-center gap-4 bg-gray-50 dark:bg-black/20 p-4 rounded-2xl">
                  <div className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-icons-round text-xl">open_in_new</span>
                  </div>
                  <p className="text-[11px] font-medium dark:text-white leading-tight">
                    Clique no ícone de <span className="font-bold">instalação</span> na barra de endereços do seu navegador.
                  </p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowPopup(false)}
              className="w-full mt-10 py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[10px] tracking-[0.2em] uppercase font-display"
            >
              Entendi
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAInstaller;
