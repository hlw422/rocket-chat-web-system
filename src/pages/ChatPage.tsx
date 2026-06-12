import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Search, Plus, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatStore } from '@/stores/chatStore';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import ChatWindow from '@/modules/chat/components/ChatWindow';
import StatusIndicator from '@/components/StatusIndicator';

const ChatPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, checkAuth } = useAuthStore();
  const { rooms, activeRoom, setActiveRoom, loadRooms, unreadCounts, isLoading, isLoaded } = useChatStore();
  const { loadMessages } = useMessageStore();
  const { subscribeToRoom, unsubscribeFromRoom, isConnected } = useWebSocket();
  const { fetchMultipleUserStatuses } = usePresenceStore();
  const [searchQuery, setSearchQuery] = useState('');
  const previousRoomIdRef = useRef<string | undefined>(undefined);
  const hasLoadedRef = useRef(false);

  // Get current username with multiple fallbacks
  const getCurrentUsername = (): string => {
    // Try multiple sources for username
    const username = user?.username || localStorage.getItem('username') || '';
    return username;
  };

  useEffect(() => {
    // Ensure user data is loaded
    if (!user) {
      checkAuth();
    }
  }, [user, checkAuth]);

  useEffect(() => {
    // Load rooms on mount, but only once
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      console.log('[ChatPage] Initial loadRooms call');
      loadRooms();
    }
  }, [loadRooms]);

  // Reload rooms when WebSocket reconnects
  useEffect(() => {
    if (isConnected && isLoaded) {
      console.log('[ChatPage] WebSocket reconnected, reloading rooms');
      loadRooms();
    }
  }, [isConnected, loadRooms, isLoaded]);

  // Fetch user statuses and set up polling every 5 seconds
  useEffect(() => {
    const fetchStatuses = () => {
      const currentUsername = user?.username || localStorage.getItem('username') || '';
      const otherUsernames = rooms
        .map(room => room.usernames?.find(u => u !== currentUsername))
        .filter((u): u is string => !!u);
      
      if (otherUsernames.length > 0) {
        fetchMultipleUserStatuses(otherUsernames);
      }
    };

    // Fetch immediately when rooms load
    if (rooms.length > 0) {
      fetchStatuses();
    }

    // Poll every 5 seconds
    const interval = setInterval(fetchStatuses, 5000);

    return () => clearInterval(interval);
  }, [rooms, user, fetchMultipleUserStatuses]);

  useEffect(() => {
    // Only run when roomId actually changes
    if (roomId && roomId !== previousRoomIdRef.current) {
      const room = rooms.find(r => r._id === roomId);
      if (room) {
        // Unsubscribe from previous room
        if (previousRoomIdRef.current) {
          unsubscribeFromRoom(previousRoomIdRef.current);
        }
        
        setActiveRoom(room);
        loadMessages(roomId);
        
        // Subscribe to new room for real-time messages
        subscribeToRoom(roomId);
        
        // Update the previous room ID ref
        previousRoomIdRef.current = roomId;
      }
    }
  }, [roomId, rooms, setActiveRoom, loadMessages, subscribeToRoom, unsubscribeFromRoom]);

  const getOtherUser = (room: any): string => {
    const currentUsername = getCurrentUsername();
    if (!currentUsername || !room.usernames || room.usernames.length < 2) {
      return '';
    }
    return room.usernames.find((u: string) => u !== currentUsername) || '';
  };

  const filteredRooms = rooms.filter(room => {
    if (!searchQuery) return true;
    const otherUser = getOtherUser(room);
    return otherUser.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter out rooms with no valid other user
  const validRooms = filteredRooms.filter(room => {
    const otherUser = getOtherUser(room);
    return otherUser && otherUser.length > 0;
  });

  const handleRoomClick = (room: any) => {
    navigate(`/chat/${room._id}`);
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full">
      {/* Conversation List */}
      <div className="w-80 min-w-[320px] border-r border-border flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">聊天</h2>
            <Button variant="ghost" size="icon" className="rounded-12" onClick={() => navigate('/contacts')}>
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <Input
              placeholder="搜索联系人"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-12 bg-background-secondary"
            />
          </div>
        </div>

        {/* Room List */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoading && rooms.length === 0 && (
              <div className="text-center py-8 text-text-tertiary">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p>加载中...</p>
              </div>
            )}

            {!isLoading && validRooms.map((room) => {
              const otherUser = getOtherUser(room);
              const unreadCount = unreadCounts[room._id] || 0;
              const isActive = activeRoom?._id === room._id;

              return (
                <div
                  key={room._id}
                  className={`flex items-center p-3 rounded-12 cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-primary/10'
                      : 'hover:bg-background-secondary'
                  }`}
                  onClick={() => handleRoomClick(room)}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {otherUser.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <StatusIndicator
                      username={otherUser}
                      size="sm"
                      className="absolute -bottom-0.5 right-2"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-text-primary truncate">
                        {otherUser}
                      </span>
                      {room.lastMessage && (
                        <span className="text-xs text-text-tertiary">
                          {new Date(room.lastMessage.ts).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-text-secondary truncate">
                        {room.lastMessage?.msg || '暂无消息'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge className="ml-2 px-1.5 py-0.5 min-w-[22px] h-[22px] text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!isLoading && validRooms.length === 0 && (
              <div className="text-center py-8 text-text-tertiary">
                <p>暂无会话</p>
                <p className="text-sm mt-1">添加好友开始聊天</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="flex-1 min-w-0">
        {activeRoom ? (
          <ChatWindow room={activeRoom} />
        ) : (
          <div className="flex items-center justify-center h-full bg-background-secondary">
            <div className="text-center text-text-tertiary">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium">选择一个会话开始聊天</p>
              <p className="text-sm mt-1">从左侧列表选择联系人</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
