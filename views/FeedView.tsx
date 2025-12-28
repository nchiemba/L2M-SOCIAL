
import React from 'react';
import { View, Story, Post } from '../types';
import BottomNav from '../components/BottomNav';
import PostCard from '../components/PostCard';

interface FeedViewProps {
  posts: Post[];
  onNavigate: (view: View, params?: any) => void;
  onOpenMenu: () => void;
}

const MOCK_STORIES: Story[] = [
  { id: '1', user: 'Seu story', avatar: 'https://picsum.photos/100?random=1', isMe: true },
  { id: '2', user: 'julia_m', avatar: 'https://picsum.photos/100?random=2' },
  { id: '3', user: 'marcos.dev', avatar: 'https://picsum.photos/100?random=3' },
  { id: '4', user: 'ana.photo', avatar: 'https://picsum.photos/100?random=4' },
];

const FeedView: React.FC<FeedViewProps> = ({ posts, onNavigate, onOpenMenu }) => {
  return (
    <div className="h-full flex flex-col pt-14 pb-20 overflow-hidden bg-white dark:bg-background-dark">
      <header className="fixed top-0 w-full max-w-md bg-white/90 dark:bg-background-dark/90 ios-blur border-b border-black/10 dark:border-border-dark z-50 h-14 flex items-center justify-between px-4">
        <button className="p-2 text-black dark:text-white" onClick={onOpenMenu}><span className="material-icons-round text-2xl">add_box</span></button>
        <span className="text-xl font-bold tracking-[0.2em] text-black dark:text-white font-display">L2M</span>
        <button className="p-2 relative text-black dark:text-white" onClick={() => onNavigate(View.CHAT)}>
          <span className="material-icons-round text-2xl">chat_bubble_outline</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-white dark:border-black"></span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        <section className="flex space-x-4 overflow-x-auto px-4 py-4 border-b border-gray-100 dark:border-border-dark no-scrollbar">
          {MOCK_STORIES.map(story => (
            <div key={story.id} className="flex flex-col items-center flex-shrink-0 space-y-1">
              <div className={`w-16 h-16 rounded-full p-[2px] ${story.isMe ? 'bg-gray-200 dark:bg-gray-800' : 'bg-black dark:bg-white'}`}>
                <div className="w-full h-full rounded-full border-2 border-white dark:border-background-dark overflow-hidden relative">
                  <img src={story.avatar} className="w-full h-full object-cover" alt={story.user} />
                  {story.isMe && (
                    <div className="absolute bottom-0 right-0 bg-black dark:bg-white w-4 h-4 rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                      <span className="material-icons-round text-[10px] text-white dark:text-black">add</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-black dark:text-white">{story.user}</span>
            </div>
          ))}
        </section>

        <section className="divide-y divide-gray-100 dark:divide-border-dark">
          {posts.map(post => (
            <PostCard key={post.id} post={post} onNavigate={onNavigate} />
          ))}
        </section>

        <div className="py-20 flex flex-col items-center opacity-50">
          <span className="material-icons-round text-3xl mb-2">auto_awesome</span>
          <p className="text-[10px] font-bold uppercase tracking-widest">Você está em dia.</p>
        </div>
      </div>

      <BottomNav currentView={View.FEED} onNavigate={onNavigate} onOpenMenu={onOpenMenu} />
    </div>
  );
};

export default FeedView;
