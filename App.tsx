
import React, { useState, useEffect } from 'react';
import { View, Post, UserProfile } from './types';
import WelcomeView from './views/WelcomeView';
import FeedView from './views/FeedView';
import ChatView from './views/ChatView';
import ProfileView from './views/ProfileView';
import SettingsView from './views/SettingsView';
import CreatePostView from './views/CreatePostView';
import CallView from './views/CallView';
import AvatarCreatorView from './views/AvatarCreatorView';
import MediaEditorView from './views/MediaEditorView';
import ActionMenu from './components/ActionMenu';
import PWAInstaller from './components/PWAInstaller';
import { supabase, isSupabaseConfigured } from './supabase';

const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    user: 'julia_m',
    avatar: 'https://picsum.photos/100?random=2',
    location: 'São Paulo, Brasil',
    image: 'https://picsum.photos/600/800?random=10',
    likes: 4230,
    caption: 'Aproveitando o pôr do sol incrível de hoje! 🌅✨ #sunset #lifestyle #l2m',
    time: 'HÁ 2 HORAS',
    type: 'image'
  }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.WELCOME);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [session, setSession] = useState<any>(null);
  
  const [myProfile, setMyProfile] = useState<UserProfile>({
    name: 'Sarah Jenkins',
    username: '@sarah_creative',
    bio: 'Digital Artist 🎨 & Photographer 📸 based in NY. Sharing my daily life and creative process.',
    avatar: 'https://picsum.photos/200?random=200',
    cover: 'https://picsum.photos/800/600?random=100',
    followers: '45.8k',
    following: '342'
  });

  const [viewingProfile, setViewingProfile] = useState<UserProfile | null>(null);
  const [chatPartner, setChatPartner] = useState<{ user: string, avatar: string }>({ user: 'Marina Silva', avatar: 'https://picsum.photos/100?random=2' });
  const [callConfig, setCallConfig] = useState<{ mode: 'voice' | 'video', user: string }>({ mode: 'voice', user: 'Marina Silva' });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn('[Supabase] Configuração não detectada. O app funcionará em modo demonstração.');
      return;
    }

    // Escutar mudanças na autenticação do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchPosts();
        setCurrentView(View.FEED);
      }
    }).catch(err => console.error('[Supabase] Erro ao obter sessão:', err));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchPosts();
        setCurrentView(View.FEED);
      } else {
        setCurrentView(View.WELCOME);
      }
    });

    const hash = window.location.hash.replace('#', '') as View;
    if (Object.values(View).includes(hash)) {
      setCurrentView(hash);
    }
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setMyProfile({
          name: data.name,
          username: data.username,
          bio: data.bio,
          avatar: data.avatar || myProfile.avatar,
          cover: data.cover || myProfile.cover,
          followers: data.followers_count?.toString() || '0',
          following: data.following_count?.toString() || '0'
        });
      }
    } catch (err) {
      console.error('[Supabase] Falha ao buscar perfil:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          location,
          image,
          caption,
          created_at,
          type,
          profiles (
            name,
            username,
            avatar
          )
        `)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const formattedPosts: Post[] = data.map((p: any) => ({
          id: p.id,
          user: p.profiles?.name || 'Usuário L2M',
          avatar: p.profiles?.avatar || 'https://picsum.photos/100',
          location: p.location,
          image: p.image,
          likes: 0,
          caption: p.caption,
          time: new Date(p.created_at).toLocaleDateString(),
          type: p.type || 'image',
          isMine: session?.user?.id === p.user_id
        }));
        setPosts(formattedPosts);
      }
    } catch (err) {
      console.error('[Supabase] Falha ao buscar posts:', err);
      // Mantém os INITIAL_POSTS se a busca falhar
    }
  };

  const navigateTo = (view: View, params?: any) => {
    if (view === View.CALL && params) setCallConfig(params);
    if (view === View.CHAT && params) setChatPartner(params);
    
    if (view === View.PROFILE && params && params.user) {
      setViewingProfile({
        name: params.user,
        username: `@${params.user.toLowerCase().replace(' ', '_')}`,
        bio: `Explorador do mundo e entusiasta do L2M Social. ✨ Criador de conteúdos digitais.`,
        avatar: params.avatar || `https://picsum.photos/200?seed=${params.user}`,
        cover: `https://picsum.photos/800/600?seed=${params.user}_cover`,
        followers: (Math.random() * 50).toFixed(1) + 'k',
        following: Math.floor(Math.random() * 500).toString()
      });
    } else if (view === View.PROFILE && !params) {
      setViewingProfile(null);
    }

    window.location.hash = view;
    setCurrentView(view);
    setIsActionMenuOpen(false);
  };

  const addPost = async (newPost: Post) => {
    if (!session || !isSupabaseConfigured) {
      // Fallback local se não houver Supabase
      setPosts([newPost, ...posts]);
      return;
    }
    
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: session.user.id,
        location: newPost.location,
        image: newPost.image,
        caption: newPost.caption,
        type: newPost.type
      });

      if (!error) fetchPosts();
    } catch (err) {
      console.error('[Supabase] Falha ao adicionar post:', err);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    setMyProfile(prev => ({ ...prev, ...updated }));

    if (!session || !isSupabaseConfigured) return;
    
    try {
      await supabase.from('profiles').update({
        name: updated.name,
        bio: updated.bio,
        avatar: updated.avatar,
        cover: updated.cover,
        username: updated.username
      }).eq('id', session.user.id);
    } catch (err) {
      console.error('[Supabase] Falha ao atualizar perfil:', err);
    }
  };

  const profilePosts = posts.filter(p => {
    if (viewingProfile) {
      return p.user === viewingProfile.name;
    }
    return p.isMine;
  });

  const renderView = () => {
    switch (currentView) {
      case View.WELCOME: return <WelcomeView onLogin={() => navigateTo(View.FEED)} />;
      case View.FEED: return <FeedView posts={posts} onNavigate={navigateTo} onOpenMenu={() => setIsActionMenuOpen(true)} />;
      case View.CHAT: return <ChatView onNavigate={navigateTo} partner={chatPartner} />;
      case View.PROFILE: return (
        <ProfileView 
          profile={viewingProfile || myProfile} 
          isOwnProfile={!viewingProfile} 
          onUpdateProfile={updateProfile} 
          posts={profilePosts} 
          onNavigate={navigateTo} 
        />
      );
      case View.SETTINGS: return (
        <SettingsView 
          profile={myProfile} 
          onNavigate={navigateTo} 
          isDarkMode={isDarkMode} 
          onToggleDark={() => {
            setIsDarkMode(!isDarkMode);
            document.documentElement.classList.toggle('dark');
          }} 
          onUpdateProfile={updateProfile}
        />
      );
      case View.CREATE: return <CreatePostView onAddPost={addPost} onNavigate={navigateTo} />;
      case View.CALL: return <CallView mode={callConfig.mode} user={callConfig.user} onEnd={() => navigateTo(View.CHAT)} />;
      case View.AVATAR_CREATOR: return <AvatarCreatorView onBack={() => navigateTo(View.CHAT)} />;
      case View.MEDIA_EDITOR: return <MediaEditorView onBack={() => navigateTo(View.FEED)} />;
      default: return <WelcomeView onLogin={() => navigateTo(View.FEED)} />;
    }
  };

  return (
    <div className={`h-full w-full max-w-md mx-auto relative overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark bg-background-dark' : 'bg-background-light'}`}>
      {renderView()}
      {isActionMenuOpen && <ActionMenu onClose={() => setIsActionMenuOpen(false)} onNavigate={navigateTo} />}
      <PWAInstaller />
    </div>
  );
};

export default App;
