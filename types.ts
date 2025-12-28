
export enum View {
  WELCOME = 'welcome',
  FEED = 'feed',
  CHAT = 'chat',
  PROFILE = 'profile',
  SETTINGS = 'settings',
  CREATE = 'create',
  CALL = 'call',
  AVATAR_CREATOR = 'avatar_creator',
  MEDIA_EDITOR = 'media_editor'
}

export interface Post {
  id: string;
  user: string;
  avatar: string;
  location: string;
  image: string;
  likes: number;
  caption: string;
  time: string;
  isMine?: boolean;
  type: 'image' | 'video';
}

export interface Story {
  id: string;
  user: string;
  avatar: string;
  isMe?: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  bio: string;
  avatar: string;
  cover: string;
  followers: string;
  following: string;
}
