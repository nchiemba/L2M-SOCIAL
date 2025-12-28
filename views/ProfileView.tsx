
import React, { useState, useRef } from 'react';
import { View, Post, UserProfile } from '../types';
import BottomNav from '../components/BottomNav';

interface ProfileViewProps {
  profile: UserProfile;
  posts: Post[];
  isOwnProfile?: boolean;
  onNavigate: (view: View, params?: any) => void;
  onUpdateProfile: (data: Partial<UserProfile>) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, posts, isOwnProfile, onNavigate, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'videos' | 'saved'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editBio, setEditBio] = useState(profile.bio);
  // Fix: Added missing isFollowing state
  const [isFollowing, setIsFollowing] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `L2M Social | Perfil de ${profile.name}`,
          text: `Confira o perfil de ${profile.name} no L2M Social: ${profile.bio}`,
          url: window.location.origin + '/#' + View.PROFILE,
        });
      } catch (err) {
        console.log("Compartilhamento cancelado");
      }
    } else {
      navigator.clipboard.writeText(window.location.origin + '/#' + View.PROFILE);
      alert("Link do perfil copiado!");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ [type]: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    onUpdateProfile({ name: editName, bio: editBio });
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark pb-20 overflow-hidden">
      <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {/* Capa */}
        <div className="relative h-60 w-full group">
          <img src={profile.cover} className="w-full h-full object-cover" alt="Cover" />
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
              >
                <span className="material-icons-round text-sm">edit</span> Alterar Capa
              </button>
            </div>
          )}
          <div className="absolute top-0 w-full p-4 pt-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
            <button onClick={() => onNavigate(View.FEED)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
              <span className="material-icons-round">arrow_back</span>
            </button>
            <span className="text-white font-bold tracking-[0.2em] font-display text-xs">
              {isOwnProfile ? 'MINHA CONTA' : 'PERFIL'}
            </span>
            <button onClick={() => onNavigate(View.SETTINGS)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 transition-transform">
              <span className="material-icons-round">settings</span>
            </button>
          </div>
        </div>

        {/* Informações Básicas */}
        <div className="relative px-6 -mt-14 pb-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-background-dark overflow-hidden shadow-2xl bg-gray-200">
                <img src={profile.avatar} className="w-full h-full object-cover" alt="Profile" />
                {isOwnProfile && (
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <span className="material-icons-round text-white">photo_camera</span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-accent text-white p-1.5 rounded-full border-2 border-white dark:border-background-dark shadow-lg active:scale-125 transition-transform"
                >
                  <span className="material-icons-round text-[10px]">add</span>
                </button>
              )}
            </div>
            
            <div className="text-center mt-4">
              <h1 className="text-xl font-bold dark:text-white uppercase font-display tracking-tight leading-tight">{profile.name}</h1>
              <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{profile.username}</p>
            </div>

            <div className="flex justify-around w-full mt-6 py-5 border-y border-gray-100 dark:border-border-dark">
              {[
                { label: 'Posts', value: isOwnProfile ? posts.length + 12 : 24 },
                { label: 'Seguidores', value: profile.followers },
                { label: 'Seguindo', value: profile.following }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <span className="block font-bold text-lg dark:text-white leading-none mb-1">{stat.value}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-6 w-full">
              {isOwnProfile ? (
                <>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">edit</span>
                    Editar Perfil
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex-[2] py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${isFollowing ? 'bg-gray-200 dark:bg-surface-dark text-black dark:text-white' : 'bg-accent text-white'}`}
                  >
                    <span className="material-icons-round text-sm">{isFollowing ? 'check' : 'person_add'}</span>
                    {isFollowing ? 'Seguindo' : 'Seguir'}
                  </button>
                  <button 
                    onClick={() => onNavigate(View.CHAT, { user: profile.name, avatar: profile.avatar })}
                    className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-2xl font-bold uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-sm">chat_bubble</span>
                    Mensagem
                  </button>
                </>
              )}
              <button 
                onClick={() => setShowQR(true)}
                className="flex-1 bg-gray-100 dark:bg-surface-dark p-3.5 rounded-2xl dark:text-white active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                <span className="material-icons-round">qr_code_2</span>
              </button>
              <button 
                onClick={handleShare}
                className="flex-1 bg-gray-100 dark:bg-surface-dark p-3.5 rounded-2xl dark:text-white active:scale-95 transition-all flex items-center justify-center shadow-sm"
              >
                <span className="material-icons-round">share</span>
              </button>
            </div>

            <p className="mt-6 text-[11px] text-center text-gray-600 dark:text-gray-400 px-4 leading-relaxed font-medium">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* Abas e Conteúdo */}
        <div className="sticky top-0 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md border-y border-gray-100 dark:border-border-dark flex z-20">
          <button onClick={() => setActiveTab('posts')} className={`flex-1 h-14 flex items-center justify-center transition-all ${activeTab === 'posts' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 opacity-60'}`}>
            <span className="material-icons-round">grid_on</span>
          </button>
          <button onClick={() => setActiveTab('videos')} className={`flex-1 h-14 flex items-center justify-center transition-all ${activeTab === 'videos' ? 'border-b-2 border-black dark:border-white text-black dark:text-white' : 'text-gray-400 opacity-60'}`}>
            <span className="material-icons-round">play_circle_outline</span>
          </button>
        </div>

        <div className="p-1">
          <div className="grid grid-cols-3 gap-0.5 bg-gray-50 dark:bg-black p-0.5 rounded-lg overflow-hidden">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-surface-dark relative group cursor-pointer overflow-hidden animate-in fade-in zoom-in duration-300">
                <img 
                  src={`https://picsum.photos/400?seed=${profile.username}_${i}_${activeTab}`} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700" 
                  alt="post" 
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowQR(false)} />
          <div className="relative w-full max-w-xs bg-white dark:bg-surface-dark rounded-[40px] p-8 animate-in zoom-in duration-300 shadow-2xl text-center border border-white/10">
            <div className="mb-6 flex justify-center">
              <div className="p-5 bg-white rounded-[32px] shadow-inner">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=l2m_social_user_${profile.username}`} 
                  className="w-44 h-44"
                  alt="QR Code"
                />
              </div>
            </div>
            <h3 className="font-display font-bold text-xs tracking-[0.2em] dark:text-white mb-2">{profile.name}</h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">{profile.username}</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleShare}
                className="w-full py-4 bg-accent text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Enviar por Mensagem
              </button>
              <button 
                onClick={() => setShowQR(false)}
                className="w-full py-4 bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsEditing(false)} />
          <div className="relative w-full max-sm bg-white dark:bg-surface-dark rounded-[32px] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl">
            <div className="w-12 h-1 bg-gray-200 dark:bg-border-dark rounded-full mx-auto mb-8" />
            <h2 className="text-center font-display font-bold text-xs tracking-[0.2em] mb-8 dark:text-white">ATUALIZAR PERFIL</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">Nome Completo</label>
                <input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/40 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent/30 transition-all"
                />
              </div>
              <div>
                <label className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] block mb-2 ml-1">Sua Bio</label>
                <textarea 
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-black/40 border-none rounded-2xl py-4 px-5 text-sm dark:text-white focus:ring-2 ring-accent/30 min-h-[120px] resize-none transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-100 dark:bg-white/5 dark:text-white py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProfile}
                  className="flex-[2] bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav currentView={View.PROFILE} onNavigate={onNavigate} />
    </div>
  );
};

export default ProfileView;
