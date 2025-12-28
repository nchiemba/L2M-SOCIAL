
import React, { useState, useRef, useEffect } from 'react';
import { Post, View } from '../types';

interface PostCardProps {
  post: Post;
  onNavigate: (view: View, params?: any) => void;
}

interface Comment {
  user: string;
  avatar: string;
  text: string;
  time: string;
  liked?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, onNavigate }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [following, setFollowing] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaveAnimating, setIsSaveAnimating] = useState(false);
  
  const commentInputRef = useRef<HTMLInputElement>(null);

  const [comments, setComments] = useState<Comment[]>([
    { 
      user: 'marcos.dev', 
      avatar: 'https://picsum.photos/100?random=30',
      text: 'Incrível! Qual lente você usou? 📸', 
      time: '2m',
      liked: true
    },
    { 
      user: 'ana.photo', 
      avatar: 'https://picsum.photos/100?random=31',
      text: 'As cores estão perfeitas.', 
      time: '1h',
      liked: false
    }
  ]);

  // Carregar estado de "salvo" do localStorage
  useEffect(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('l2m_saved_posts') || '[]');
      setIsSaved(savedPosts.includes(post.id));
    } catch (e) {
      console.error("Erro ao ler localStorage", e);
    }
  }, [post.id]);

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikesCount(prev => prev + 1);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 400);
    } else {
      setLiked(false);
      setLikesCount(prev => prev - 1);
    }
  };

  const handleToggleSave = () => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('l2m_saved_posts') || '[]');
      let newSavedPosts;
      if (isSaved) {
        newSavedPosts = savedPosts.filter((id: string) => id !== post.id);
      } else {
        newSavedPosts = [...savedPosts, post.id];
        setIsSaveAnimating(true);
        setTimeout(() => setIsSaveAnimating(false), 400);
      }
      localStorage.setItem('l2m_saved_posts', JSON.stringify(newSavedPosts));
      setIsSaved(!isSaved);
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }
  };

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    setShowHeartAnim(true);
    setTimeout(() => setShowHeartAnim(false), 800);
  };

  const handleFollow = () => {
    setFollowing(!following);
  };

  const handleAddComment = () => {
    if (commentInput.trim()) {
      const newComment: Comment = { 
        user: 'você', 
        avatar: 'https://picsum.photos/100?random=55',
        text: commentInput, 
        time: 'agora',
        liked: false
      };
      setComments([...comments, newComment]);
      setCommentInput('');
      setShowAllComments(true);
    }
  };

  const toggleCommentLike = (index: number) => {
    const newComments = [...comments];
    newComments[index].liked = !newComments[index].liked;
    setComments(newComments);
  };

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  const toggleQuickView = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsQuickViewOpen(!isQuickViewOpen);
    setZoomScale(1);
  };

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(prev => (prev === 1 ? 2 : 1));
  };

  const goToUserProfile = () => {
    onNavigate(View.PROFILE, { user: post.user, avatar: post.avatar });
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <article className="pb-4 border-b border-gray-100 dark:border-border-dark animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Cabeçalho do Post */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center space-x-2">
          <img 
            src={post.avatar} 
            onClick={goToUserProfile}
            className="w-9 h-9 rounded-full border-2 border-gray-100 dark:border-gray-800 object-cover shadow-sm cursor-pointer" 
            alt={post.user} 
          />
          <div>
            <div className="flex items-center gap-2">
              <p onClick={goToUserProfile} className="text-sm font-bold text-black dark:text-white leading-none cursor-pointer hover:underline">{post.user}</p>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <button 
                onClick={handleFollow}
                className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${following ? 'text-gray-400' : 'text-accent'}`}
              >
                {following ? 'Seguindo' : 'Seguir'}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">{post.location}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-black dark:hover:text-white transition-colors">
          <span className="material-icons-round">more_horiz</span>
        </button>
      </div>
      
      {/* Imagem do Post */}
      <div 
        className="w-full aspect-square bg-gray-50 dark:bg-gray-900 relative group cursor-pointer overflow-hidden"
        onDoubleClick={handleDoubleTap}
      >
        <img src={post.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Post" />
        
        {/* Botão de Quick View */}
        <button 
          onClick={toggleQuickView}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
        >
          <span className="material-icons-round">fullscreen</span>
        </button>

        {/* Animação de Coração no Double Tap */}
        {showHeartAnim && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span className="material-icons-round text-white text-8xl animate-heart-pop opacity-90">favorite</span>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => toggleQuickView()}
        >
          <div className="absolute top-0 w-full p-4 flex justify-between items-center text-white z-10">
            <div className="flex items-center gap-3">
              <img src={post.avatar} className="w-8 h-8 rounded-full border border-white/20" alt={post.user} />
              <span className="text-sm font-bold tracking-widest uppercase font-display">{post.user}</span>
            </div>
            <button onClick={toggleQuickView} className="p-2 bg-white/10 rounded-full active:scale-90 transition-transform">
              <span className="material-icons-round">close</span>
            </button>
          </div>

          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={post.image} 
              className={`max-w-full max-h-[80vh] object-contain transition-transform duration-300 cursor-zoom-in shadow-2xl ${zoomScale > 1 ? 'scale-150 cursor-zoom-out' : 'scale-100'}`}
              style={{ transform: `scale(${zoomScale})` }}
              alt="Quick View"
              onClick={handleZoom}
            />
          </div>

          <div className="absolute bottom-10 flex gap-4">
             <button 
               onClick={handleZoom}
               className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full text-white font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2"
             >
               <span className="material-icons-round text-sm">{zoomScale > 1 ? 'zoom_out' : 'zoom_in'}</span>
               {zoomScale > 1 ? 'REDUZIR' : 'ZOOM'}
             </button>
             <button 
               onClick={handleLike}
               className={`bg-white/10 backdrop-blur-md px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 ${liked ? 'text-red-500' : 'text-white'} ${isLikeAnimating ? 'animate-heart-pop' : ''}`}
             >
               <span className="material-icons-round text-sm">{liked ? 'favorite' : 'favorite_border'}</span>
               {liked ? 'AMEI' : 'GOSTAR'}
             </button>
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="px-3 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex space-x-5">
            <button 
              onClick={handleLike}
              className={`transition-all active:scale-125 ${liked ? 'text-red-500' : 'text-black dark:text-white'} ${isLikeAnimating ? 'animate-heart-pop' : ''}`}
            >
              <span className="material-icons-round text-2xl">
                {liked ? 'favorite' : 'favorite_border'}
              </span>
            </button>
            <button onClick={focusCommentInput} className="text-black dark:text-white hover:text-accent transition-colors">
              <span className="material-icons-round text-2xl">chat_bubble_outline</span>
            </button>
            <button onClick={() => onNavigate(View.CHAT, { user: post.user, avatar: post.avatar })} className="text-black dark:text-white hover:text-accent transition-colors">
              <span className="material-icons-round text-2xl transform -rotate-12">send</span>
            </button>
          </div>
          <button 
            onClick={handleToggleSave}
            className={`transition-all active:scale-125 ${isSaved ? 'text-accent' : 'text-black dark:text-white'} ${isSaveAnimating ? 'animate-heart-pop' : ''}`}
          >
            <span className="material-icons-round text-2xl">
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
        </div>
        
        {/* Contador e Legenda */}
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-black dark:text-white">
            {likesCount.toLocaleString()} curtidas
          </p>
          <div className="text-sm leading-snug">
            <span className="font-bold mr-2 text-black dark:text-white cursor-pointer hover:underline" onClick={goToUserProfile}>{post.user}</span>
            <span className="text-black dark:text-gray-300">{post.caption}</span>
          </div>
        </div>

        {/* Seção de Comentários */}
        <div className="pt-2 space-y-3">
          {comments.length > 2 && !showAllComments && (
            <button 
              onClick={() => setShowAllComments(true)}
              className="text-gray-500 text-[11px] font-bold uppercase tracking-widest hover:text-accent transition-colors block ml-1"
            >
              Ver todos os {comments.length} comentários
            </button>
          )}
          
          <div className="space-y-3">
            {displayedComments.map((c, i) => (
              <div key={i} className="flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                <img src={c.avatar} className="w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 dark:ring-white/5" alt={c.user} />
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl rounded-tl-none px-3 py-2 relative">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="font-bold text-[11px] text-black dark:text-white truncate">{c.user}</span>
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter whitespace-nowrap">{c.time}</span>
                    </div>
                    <p className="text-xs text-black dark:text-gray-300 leading-normal">{c.text}</p>
                    
                    <button 
                      onClick={() => toggleCommentLike(i)}
                      className={`absolute -right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-white/10 transition-all active:scale-125 ${c.liked ? 'text-red-500 animate-heart-pop' : 'text-gray-400'}`}
                    >
                      <span className="material-icons-round text-[10px]">{c.liked ? 'favorite' : 'favorite_border'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <img src="https://picsum.photos/100?random=55" className="w-7 h-7 rounded-full object-cover ring-1 ring-gray-100 dark:ring-white/10" alt="Me" />
            <div className="flex-1 flex items-center bg-gray-100 dark:bg-white/5 rounded-full px-4 py-2 group focus-within:ring-2 ring-accent/20 transition-all">
              <input 
                ref={commentInputRef}
                type="text" 
                placeholder="Escreva algo legal..." 
                className="flex-1 bg-transparent border-none text-sm p-0 focus:ring-0 placeholder-gray-400 dark:text-white"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              {commentInput.trim() && (
                <button 
                  onClick={handleAddComment}
                  className="text-accent text-xs font-bold active:scale-95 transition-transform ml-2 uppercase tracking-widest"
                >
                  Postar
                </button>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-[9px] text-gray-400 tracking-[0.2em] font-bold uppercase pt-3 opacity-80">
          {post.time} • L2M DIGITAL
        </p>
      </div>
    </article>
  );
};

export default PostCard;
