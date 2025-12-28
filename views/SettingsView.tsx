
import React, { useState } from 'react';
import { View, UserProfile } from '../types';
import BottomNav from '../components/BottomNav';

interface SettingsViewProps {
  profile: UserProfile;
  onNavigate: (view: View, params?: any) => void;
  isDarkMode: boolean;
  onToggleDark: () => void;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

type SubView = 'main' | 'account' | 'notifications' | 'security' | 'data';

const SettingsView: React.FC<SettingsViewProps> = ({ profile, onNavigate, isDarkMode, onToggleDark, onUpdateProfile }) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('main');
  
  // States for new features
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const [notifications, setNotifications] = useState({ push: true, email: false, dms: true });
  const [twoFactor, setTwoFactor] = useState(false);
  const [storageUsage, setStorageUsage] = useState(1.2);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus('loading');
    setTimeout(() => {
      setPasswordStatus('success');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordStatus('idle');
        setPasswordForm({ current: '', new: '', confirm: '' });
      }, 2000);
    }, 1500);
  };

  const renderHeader = (title: string) => (
    <header className="flex items-center px-4 h-14 bg-white/90 dark:bg-background-dark/90 ios-blur border-b border-gray-100 dark:border-border-dark fixed top-0 w-full max-w-md z-[60]">
      <button onClick={() => setActiveSubView('main')} className="p-2 text-accent">
        <span className="material-icons-round">arrow_back_ios_new</span>
      </button>
      <h2 className="flex-1 text-center font-display font-bold text-[10px] tracking-[0.2em] dark:text-white">{title}</h2>
      <div className="w-10"></div>
    </header>
  );

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all relative ${active ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-800'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`}></div>
    </button>
  );

  if (activeSubView === 'account') {
    return (
      <div className="h-full bg-white dark:bg-background-dark pt-14 animate-in slide-in-from-right duration-300">
        {renderHeader('MINHA CONTA')}
        <div className="p-6 space-y-8 pb-24 overflow-y-auto h-full no-scrollbar">
          <div className="flex flex-col items-center py-4">
            <div className="relative group mb-4">
              <img src={profile.avatar} className="w-24 h-24 rounded-full border-4 border-gray-100 dark:border-gray-800 object-cover" alt="User" />
              <button 
                onClick={() => onNavigate(View.PROFILE)}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-icons-round text-white text-sm">edit</span>
              </button>
            </div>
            <button onClick={() => onNavigate(View.PROFILE)} className="text-accent text-[10px] font-bold uppercase tracking-widest">Alterar Foto no Perfil</button>
          </div>
          
          <button 
            onClick={() => setShowQRCode(true)}
            className="w-full flex items-center justify-between p-5 bg-black text-white rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="material-icons-round">qr_code_2</span>
              <span className="text-xs font-bold uppercase tracking-[0.15em]">Meu Código QR</span>
            </div>
            <span className="material-icons-round text-gray-400">chevron_right</span>
          </button>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-surface-dark p-4 rounded-2xl">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nome de Exibição</span>
              <input 
                value={profile.name}
                onChange={(e) => onUpdateProfile({ name: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-sm dark:text-white font-medium focus:ring-0"
              />
            </div>
            <div className="bg-gray-50 dark:bg-surface-dark p-4 rounded-2xl">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Username</span>
              <input 
                value={profile.username}
                onChange={(e) => onUpdateProfile({ username: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-sm dark:text-white font-medium focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Modal QR Code */}
        {showQRCode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowQRCode(false)} />
            <div className="relative bg-white dark:bg-surface-dark w-full max-w-xs rounded-[40px] p-8 animate-in zoom-in duration-300 shadow-2xl text-center">
              <div className="mb-6 flex justify-center">
                <div className="p-4 bg-white rounded-3xl shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=l2m_social_user_${profile.username}`} 
                    className="w-48 h-48"
                    alt="QR Code"
                  />
                </div>
              </div>
              <h3 className="font-display font-bold text-xs tracking-widest dark:text-white mb-2">{profile.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">{profile.username}</p>
              <button 
                onClick={() => setShowQRCode(false)}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-[10px] uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSubView === 'security') {
    return (
      <div className="h-full bg-white dark:bg-background-dark pt-14 animate-in slide-in-from-right duration-300">
        {renderHeader('SEGURANÇA')}
        <div className="p-6 space-y-6">
          <div className="bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-transparent flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold dark:text-white">Autenticação 2FA</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Dobrar proteção da conta</p>
            </div>
            <Toggle active={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
          </div>

          <button 
            onClick={() => setIsChangingPassword(true)}
            className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl font-bold text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-sm">lock_reset</span>
            Alterar Senha de Acesso
          </button>

          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2">Histórico de Acesso</h4>
            <div className="bg-gray-50 dark:bg-surface-dark rounded-2xl p-4 flex items-center gap-4">
              <span className="material-icons-round text-accent">smartphone</span>
              <div>
                <p className="text-xs font-bold dark:text-white">iPhone 15 Pro Max • Local</p>
                <p className="text-[10px] text-gray-400">Ativo agora • São Paulo, Brasil</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Alterar Senha */}
        {isChangingPassword && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsChangingPassword(false)} />
            <form 
              onSubmit={handlePasswordChange}
              className="relative w-full max-w-sm bg-white dark:bg-surface-dark rounded-[32px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl"
            >
              <h2 className="text-center font-display font-bold text-xs tracking-[0.2em] mb-8 dark:text-white uppercase">Nova Senha</h2>
              
              {passwordStatus === 'success' ? (
                <div className="py-10 flex flex-col items-center animate-in zoom-in">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4">
                    <span className="material-icons-round text-3xl">check</span>
                  </div>
                  <p className="text-sm font-bold dark:text-white uppercase tracking-widest">Senha Alterada!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <input 
                      type="password"
                      placeholder="Senha Atual"
                      required
                      className="w-full bg-gray-50 dark:bg-black/40 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent/30"
                      value={passwordForm.current}
                      onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                    />
                    <input 
                      type="password"
                      placeholder="Nova Senha"
                      required
                      className="w-full bg-gray-50 dark:bg-black/40 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent/30"
                      value={passwordForm.new}
                      onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                    />
                    <input 
                      type="password"
                      placeholder="Confirmar Nova Senha"
                      required
                      className="w-full bg-gray-50 dark:bg-black/40 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent/30"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="flex-1 bg-gray-100 dark:bg-white/5 dark:text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={passwordStatus === 'loading'}
                      className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all disabled:opacity-50"
                    >
                      {passwordStatus === 'loading' ? 'Processando...' : 'Confirmar'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }

  if (activeSubView === 'notifications') {
    return (
      <div className="h-full bg-white dark:bg-background-dark pt-14 animate-in slide-in-from-right duration-300">
        {renderHeader('NOTIFICAÇÕES')}
        <div className="p-6">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-gray-100 dark:border-transparent divide-y divide-gray-100 dark:divide-border-dark overflow-hidden">
            <div className="flex items-center justify-between p-5">
              <div>
                <h3 className="text-sm font-bold dark:text-white">Push Notifications</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Alertas em tempo real no dispositivo</p>
              </div>
              <Toggle active={notifications.push} onToggle={() => setNotifications(n => ({...n, push: !n.push}))} />
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <h3 className="text-sm font-bold dark:text-white">Mensagens Diretas</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Novas mensagens e chats</p>
              </div>
              <Toggle active={notifications.dms} onToggle={() => setNotifications(n => ({...n, dms: !n.dms}))} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubView === 'data') {
    return (
      <div className="h-full bg-white dark:bg-background-dark pt-14 animate-in slide-in-from-right duration-300">
        {renderHeader('DADOS E PRIVACIDADE')}
        <div className="p-6 space-y-8">
          <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold dark:text-white mb-6">Armazenamento Cloud</h3>
            <div className="h-4 w-full bg-gray-100 dark:bg-black rounded-full overflow-hidden mb-4">
              <div className="h-full bg-accent" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>{storageUsage} GB USADOS</span>
              <span>2.0 GB TOTAL</span>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { alert("Cache limpo!"); setStorageUsage(0.8); }}
              className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-surface-dark rounded-2xl active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="material-icons-round text-gray-400">delete_sweep</span>
                <span className="text-xs font-bold dark:text-white uppercase tracking-wider">Limpar Cache do App</span>
              </div>
              <span className="material-icons-round text-gray-300">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-background-dark overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pt-12 pb-24 px-4">
        <div className="flex flex-col items-center py-6">
          <div className="w-20 h-20 mb-4 rounded-3xl bg-black dark:bg-surface-dark shadow-xl flex items-center justify-center">
            <span className="text-2xl font-bold tracking-[0.2em] text-white font-display">L2M</span>
          </div>
          <h1 className="text-xl font-bold text-black dark:text-white font-display">CONFIGURAÇÕES</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Painel de Controle</p>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-md mb-8 overflow-hidden border border-gray-100 dark:border-transparent">
          <div className="flex items-center p-5 hover:bg-black/5 transition-colors cursor-pointer" onClick={() => onNavigate(View.PROFILE)}>
            <div className="relative">
              <img src={profile.avatar} className="w-16 h-16 rounded-full border-2 border-white dark:border-gray-800 shadow-md object-cover" alt="User" />
              <div className="absolute bottom-0 right-0 bg-black text-white p-1 rounded-full border-2 border-white dark:border-surface-dark shadow-sm">
                <span className="material-icons-round text-[10px] block">edit</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h2 className="font-bold text-black dark:text-white font-display text-sm uppercase">{profile.name}</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-tight mt-1">ID: {profile.username.replace('@', '').toUpperCase()}-L2M</p>
              <p className="text-[10px] text-black dark:text-white font-bold mt-2 uppercase underline decoration-accent decoration-2">Editar Perfil</p>
            </div>
            <span className="material-icons-round text-gray-300">chevron_right</span>
          </div>
        </div>

        <h3 className="text-[10px] font-bold text-black dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2 font-display">VISUAL</h3>
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-md mb-8 overflow-hidden border border-gray-100 dark:border-transparent">
          <div className="flex items-center justify-between p-5">
            <div className="flex items-center">
              <div className="bg-black dark:bg-white p-2 rounded-xl mr-4 text-white dark:text-black shadow-sm">
                <span className="material-icons-round text-lg block">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">MODO ESCURO</span>
            </div>
            <Toggle active={isDarkMode} onToggle={onToggleDark} />
          </div>
        </div>

        <h3 className="text-[10px] font-bold text-black dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2 font-display">GERAL</h3>
        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-md mb-8 overflow-hidden divide-y divide-gray-100 dark:divide-border-dark border border-gray-100 dark:border-transparent">
          {[
            { id: 'account', label: 'CONTA', icon: 'person' },
            { id: 'notifications', label: 'NOTIFICAÇÕES', icon: 'notifications' },
            { id: 'security', label: 'SEGURANÇA', icon: 'lock' },
            { id: 'data', label: 'DADOS', icon: 'data_usage' }
          ].map(item => (
            <div 
              key={item.label} 
              className="flex items-center justify-between p-5 hover:bg-black/5 transition-colors cursor-pointer group"
              onClick={() => setActiveSubView(item.id as SubView)}
            >
              <div className="flex items-center">
                <div className="bg-black p-2 rounded-xl mr-4 text-white shadow-sm group-hover:scale-110 transition-transform">
                  <span className="material-icons-round text-lg block">{item.icon}</span>
                </div>
                <span className="text-sm font-bold text-black dark:text-white uppercase tracking-wider">{item.label}</span>
              </div>
              <span className="material-icons-round text-gray-300">chevron_right</span>
            </div>
          ))}
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-5 bg-black text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-transform font-display text-xs tracking-widest"
        >
          Sair da Sessão
        </button>
      </div>

      <BottomNav currentView={View.SETTINGS} onNavigate={onNavigate} />
    </div>
  );
};

export default SettingsView;
