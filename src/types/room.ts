export interface Room {
  _id: string;
  t: 'd' | 'c' | 'p'; // d=direct, c=channel, p=private group
  name?: string;
  fname?: string;
  msgs: number;
  usersCount: number;
  u: {
    _id: string;
    username: string;
  };
  ts: Date;
  _updatedAt: Date;
  lastMessage?: {
    _id: string;
    msg: string;
    ts: Date;
    u: {
      _id: string;
      username: string;
    };
  };
  topic?: string;
  announcement?: string;
  description?: string;
  pinned?: boolean;
  unread?: number;
  alert?: boolean;
  userMentions?: number;
  groupMentions?: number;
}

export interface DirectMessageRoom extends Room {
  t: 'd';
  usernames: string[];
}