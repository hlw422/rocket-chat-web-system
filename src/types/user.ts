export interface User {
  _id: string;
  username: string;
  name?: string;
  emails?: Array<{ address: string; verified: boolean }>;
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusText?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile extends User {
  bio?: string;
  phone?: string;
  avatar?: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Friend {
  _id: string;
  user: User;
  addedAt: Date;
  isBlocked: boolean;
}