import { useMessageStore } from '@/stores/messageStore';
import { useChatStore } from '@/stores/chatStore';
import { useNotificationStore } from '@/stores/notificationStore';
import type { Message } from '@/types/message';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/websocket`;

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isLoggedIn = false;
  private pendingRoomSubscriptions: Set<string> = new Set();

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
  }

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!token || !userId) {
        throw new Error('No auth token or user ID');
      }

      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Send connect message
        this.send({
          msg: 'connect',
          version: '1',
          support: ['1'],
        });

        // Start heartbeat
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.isConnecting = false;
        this.isLoggedIn = false;
        this.stopHeartbeat();

        if (!event.wasClean) {
          this.reconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'User disconnected');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnect
    this.isLoggedIn = false;
    this.pendingRoomSubscriptions.clear();
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ msg: 'ping' });
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(data: any): void {
    console.log('[WebSocket] Received message:', data.msg, data);
    switch (data.msg) {
      case 'connected':
        console.log('WebSocket connected, logging in...');
        this.loginWithToken();
        break;

      case 'result':
        this.handleResultMessage(data);
        break;

      case 'ping':
        this.send({ msg: 'pong' });
        break;

      case 'changed':
        this.handleChangeMessage(data);
        break;

      case 'updated':
        // Subscription updated
        break;

      case 'error':
        console.error('WebSocket error message:', data);
        break;
    }
  }

  private handleChangeMessage(data: any): void {
    const { collection, fields } = data;
    console.log('[WebSocket] Changed message:', collection, fields);

    switch (collection) {
      case 'stream-room-messages':
        this.handleRoomMessage(fields);
        break;

      case 'stream-notify-user':
        this.handleUserNotification(fields);
        break;

      case 'stream-notify-room':
        this.handleRoomNotification(fields);
        break;
    }
  }

  private handleRoomMessage(fields: any): void {
    const message = fields?.args?.[0];
    if (!message) return;

    const roomId = message.rid;
    const currentUserId = localStorage.getItem('userId');
    const isOwnMessage = message.u._id === currentUserId;

    // Update room's last message (for all messages including own)
    const { rooms, isLoaded } = useChatStore.getState();
    const roomIndex = rooms.findIndex(room => room._id === roomId);
    
    if (roomIndex >= 0) {
      // Room exists, update its last message
      const updatedRooms = [...rooms];
      updatedRooms[roomIndex] = {
        ...updatedRooms[roomIndex],
        lastMessage: {
          _id: message._id,
          msg: message.msg,
          ts: message.ts,
          u: message.u,
        },
      };
      useChatStore.setState({ rooms: updatedRooms });
    } else if (isLoaded) {
      // Room doesn't exist in list, but rooms have been loaded - reload to get the new room
      useChatStore.getState().loadRooms();
    }
    // If rooms haven't been loaded yet (isLoaded is false), don't trigger loadRooms
    // as it will be loaded when the ChatPage mounts

    // Only add message to store and send notification for OTHER users' messages.
    // Own messages are handled by sendMessage's optimistic update + REST API response.
    // This prevents the duplicate message bug where both REST and WebSocket add the same message.
    if (!isOwnMessage) {
      useMessageStore.getState().addMessage(roomId, message);

      const { sendNotification } = useNotificationStore.getState();
      sendNotification(
        message.u.name || message.u.username,
        message.msg.substring(0, 50) + (message.msg.length > 50 ? '...' : '')
      );

      // Update unread count
      const { activeRoom } = useChatStore.getState();
      if (activeRoom?._id !== roomId) {
        useChatStore.getState().updateUnreadCount(roomId, 
          (useChatStore.getState().unreadCounts[roomId] || 0) + 1
        );
      }
    }
  }

  private handleUserNotification(fields: any): void {
    const { eventName, args } = fields;
    
    if (eventName?.includes('/notification')) {
      console.log('User notification:', args);
    }
  }

  private handleRoomNotification(fields: any): void {
    const { eventName, args } = fields;
    console.log('[WebSocket] Room notification:', eventName, args);
    
    if (eventName?.includes('/read')) {
      const roomId = eventName.split('/')[0];
      const currentUserId = localStorage.getItem('userId');
      const readerUserId = args?.[0];
      
      console.log('[WebSocket] Read event:', { roomId, currentUserId, readerUserId });
      
      // Only mark as read when the OTHER user reads messages
      if (readerUserId && currentUserId && readerUserId !== currentUserId) {
        console.log('[WebSocket] Marking messages as read for room:', roomId);
        useMessageStore.getState().markRoomMessagesAsRead(roomId, currentUserId);
      }
    }
  }

  private loginWithToken(): void {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      console.error('No auth token or user ID for WebSocket login');
      return;
    }

    // Login with resume token
    this.send({
      msg: 'method',
      method: 'login',
      id: 'login',
      params: [{ resume: token }],
    });
  }

  private handleResultMessage(data: any): void {
    if (data.id === 'login') {
      if (data.error) {
        console.error('WebSocket login failed:', data.error);
        this.isLoggedIn = false;
        return;
      }
      console.log('WebSocket login successful');
      this.isLoggedIn = true;
      
      const userId = localStorage.getItem('userId');
      
      // Subscribe to user notifications after successful login
      this.send({
        msg: 'sub',
        id: 'stream-notify-user',
        name: 'stream-notify-user',
        params: [`${userId}/notification`, false],
      });

      // Subscribe to all pending rooms
      this.pendingRoomSubscriptions.forEach((roomId) => {
        this.sendSubscribeToRoom(roomId);
      });
      
      return;
    }
    
    // Handle other subscription results
    if (data.error) {
      console.error('Subscription error:', data.id, data.error);
    }
  }

  subscribeToRoom(roomId: string): void {
    // Track this room for subscription
    this.pendingRoomSubscriptions.add(roomId);
    
    // Only send subscription if logged in
    if (this.isLoggedIn) {
      this.sendSubscribeToRoom(roomId);
    }
    // If not logged yet, the subscription will happen after login in handleLoginSuccess
  }

  unsubscribeFromRoom(roomId: string): void {
    this.pendingRoomSubscriptions.delete(roomId);
    this.send({
      msg: 'unsub',
      id: `stream-room-messages-${roomId}`,
    });
    this.send({
      msg: 'unsub',
      id: `stream-notify-room-${roomId}`,
    });
  }

  private sendSubscribeToRoom(roomId: string): void {
    console.log('[WebSocket] Subscribing to room:', roomId);
    this.send({
      msg: 'sub',
      id: `stream-room-messages-${roomId}`,
      name: 'stream-room-messages',
      params: [roomId, true],
    });

    // Subscribe to room read events
    this.send({
      msg: 'sub',
      id: `stream-notify-room-${roomId}`,
      name: 'stream-notify-room',
      params: [`${roomId}/read`, false],
    });
    
    // Also try subscribing with different format
    this.send({
      msg: 'sub',
      id: `stream-notify-room-read-${roomId}`,
      name: 'stream-notify-room',
      params: [roomId, false],
    });
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const websocketService = new WebSocketService();