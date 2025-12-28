
import React, { useState } from 'react';
import { supabase } from '../supabase';

interface WelcomeViewProps {
  onLogin: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'welcome' | 'login' | 'signup'>('welcome');
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Confirme seu e-mail para ativar a conta!');
        setMode('login');
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (mode !== 'welcome') {
    return (
      <div className="h-full flex flex-col p-8 bg-white dark:bg-background-dark animate-in fade-in duration-500">
        <button onClick={() => setMode('welcome')} className="self-start p-2 -ml-2 text-accent">
          <span className="material-icons-round">arrow_back</span>
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl font-bold font-display dark:text-white mb-2">
            {mode === 'login' ? 'BEM-VINDO' : 'CRIAR CONTA'}
          </h2>
          <p className="text-sm text-gray-500 mb-8 font-medium">Insira suas credenciais L2M.</p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">E-mail</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent"
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && <p className="text-red-500 text-[10px] font-bold uppercase">{errorMsg}</p>}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl shadow-xl active:scale-95 transition-all font-display text-xs tracking-widest"
            >
              {isLoading ? 'PROCESSANDO...' : mode === 'login' ? 'ENTRAR AGORA' : 'REGISTAR'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between p-8 bg-white dark:bg-background-dark">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-40 h-40 bg-black dark:bg-white rounded-3xl shadow-2xl flex items-center justify-center p-4">
          <span className="text-4xl font-bold tracking-tighter text-white dark:text-black font-display">L2M</span>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold dark:text-white font-display">L2M</h1>
          <p className="text-lg text-black dark:text-gray-400 font-medium tracking-widest uppercase text-[10px]">Connect. Share. Be You.</p>
        </div>

        <p className="text-center text-black dark:text-gray-400 text-sm max-w-[280px]">
          Join the ultimate social platform for seamless media sharing and instant messaging.
        </p>

        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-black dark:bg-white"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
        </div>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => setMode('login')}
          className="w-full py-5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 font-display text-sm"
        >
          Entrar
          <span className="material-icons-round text-sm">arrow_forward</span>
        </button>
        <button 
          onClick={() => setMode('signup')}
          className="w-full py-5 border-2 border-black dark:border-white font-bold rounded-2xl text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-display text-xs"
        >
          Criar Conta
        </button>
        <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">
          L2M DIGITAL SOCIAL NETWORK
        </p>
      </div>
    </div>
  );
};

export default WelcomeView;
