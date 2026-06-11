import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'rocket-chat-web';
const DB_VERSION = 1;

interface ChatDB {
  messages: {
    key: string;
    value: {
      roomId: string;
      messages: any[];
      lastUpdated: Date;
    };
    indexes: { 'by-room': string };
  };
  users: {
    key: string;
    value: {
      userId: string;
      user: any;
      lastUpdated: Date;
    };
    indexes: { 'by-user': string };
  };
  rooms: {
    key: string;
    value: {
      roomId: string;
      room: any;
      lastUpdated: Date;
    };
    indexes: { 'by-room': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ChatDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messageStore = db.createObjectStore('messages', { keyPath: 'roomId' });
          messageStore.createIndex('by-room', 'roomId');
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'userId' });
          userStore.createIndex('by-user', 'userId');
        }

        // Rooms store
        if (!db.objectStoreNames.contains('rooms')) {
          const roomStore = db.createObjectStore('rooms', { keyPath: 'roomId' });
          roomStore.createIndex('by-room', 'roomId');
        }
      },
    });
  }
  return dbPromise;
};

export const storageService = {
  // Messages
  async getMessages(roomId: string): Promise<any[] | null> {
    const db = await getDB();
    const data = await db.get('messages', roomId);
    return data?.messages || null;
  },

  async setMessages(roomId: string, messages: any[]): Promise<void> {
    const db = await getDB();
    await db.put('messages', {
      roomId,
      messages,
      lastUpdated: new Date(),
    });
  },

  async addMessage(roomId: string, message: any): Promise<void> {
    const db = await getDB();
    const data = await db.get('messages', roomId);
    const messages = data?.messages || [];
    messages.push(message);
    await db.put('messages', {
      roomId,
      messages,
      lastUpdated: new Date(),
    });
  },

  // Users
  async getUser(userId: string): Promise<any | null> {
    const db = await getDB();
    const data = await db.get('users', userId);
    return data?.user || null;
  },

  async setUser(userId: string, user: any): Promise<void> {
    const db = await getDB();
    await db.put('users', {
      userId,
      user,
      lastUpdated: new Date(),
    });
  },

  // Rooms
  async getRoom(roomId: string): Promise<any | null> {
    const db = await getDB();
    const data = await db.get('rooms', roomId);
    return data?.room || null;
  },

  async setRoom(roomId: string, room: any): Promise<void> {
    const db = await getDB();
    await db.put('rooms', {
      roomId,
      room,
      lastUpdated: new Date(),
    });
  },

  async getAllRooms(): Promise<any[]> {
    const db = await getDB();
    const data = await db.getAll('rooms');
    return data.map(d => d.room);
  },

  // Clear old data (older than 7 days)
  async clearOldData(): Promise<void> {
    const db = await getDB();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Clear old messages
    const messages = await db.getAll('messages');
    for (const msg of messages) {
      if (new Date(msg.lastUpdated) < sevenDaysAgo) {
        await db.delete('messages', msg.roomId);
      }
    }

    // Clear old users
    const users = await db.getAll('users');
    for (const user of users) {
      if (new Date(user.lastUpdated) < sevenDaysAgo) {
        await db.delete('users', user.userId);
      }
    }

    // Clear old rooms
    const rooms = await db.getAll('rooms');
    for (const room of rooms) {
      if (new Date(room.lastUpdated) < sevenDaysAgo) {
        await db.delete('rooms', room.roomId);
      }
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('messages');
    await db.clear('users');
    await db.clear('rooms');
  },
};