export interface Message {
  _id: string;
  rid: string;
  msg: string;
  ts: Date;
  u: {
    _id: string;
    username: string;
    name?: string;
  };
  _updatedAt?: Date;
  editedBy?: {
    _id: string;
    username: string;
  };
  editedAt?: Date;
  urls?: Array<{
    url: string;
    meta?: {
      pageTitle?: string;
      description?: string;
    };
  }>;
  attachments?: Array<{
    title?: string;
    description?: string;
    title_link?: string;
    image_url?: string;
    image_type?: string;
    image_size?: number;
    audio_url?: string;
    audio_type?: string;
    audio_size?: number;
    video_url?: string;
    video_type?: string;
    video_size?: number;
  }>;
  file?: {
    _id: string;
    name: string;
    type: string;
    size: number;
  };
  starred?: Array<{ _id: string }>;
  pinned?: boolean;
  reactions?: Record<string, { usernames: string[] }>;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface SendMessagePayload {
  rid: string;
  msg: string;
}

export interface MessageStatus {
  messageId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}