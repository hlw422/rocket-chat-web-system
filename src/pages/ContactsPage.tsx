import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFriendStore } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useNavigate } from 'react-router-dom';
import StatusIndicator from '@/components/StatusIndicator';

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchMultipleUserStatuses } = usePresenceStore();
  const {
    friends,
    searchResults,
    isLoading,
    searchUsers,
    sendFriendRequest,
    loadFriends,
    clearSearchResults,
  } = useFriendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState('');

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // Fetch friend statuses and poll every 5 seconds
  useEffect(() => {
    const fetchStatuses = () => {
      const friendUsernames = friends.map(f => f.user.username);
      if (friendUsernames.length > 0) {
        fetchMultipleUserStatuses(friendUsernames);
      }
    };

    if (friends.length > 0) {
      fetchStatuses();
    }

    const interval = setInterval(fetchStatuses, 5000);
    return () => clearInterval(interval);
  }, [friends, fetchMultipleUserStatuses]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearSearchResults();
    }
  }, [searchQuery, searchUsers, clearSearchResults]);

  const handleStartChat = (username: string) => {
    navigate('/chat');
  };

  const handleAddClick = (username: string) => {
    setSelectedUsername(username);
    setRequestMessage('你好，我想加你为好友');
    setShowRequestDialog(true);
  };

  const handleSendRequest = async () => {
    if (!selectedUsername || !requestMessage.trim()) return;
    try {
      await sendFriendRequest(selectedUsername, requestMessage);
      setShowRequestDialog(false);
      setSelectedUsername('');
      setRequestMessage('');
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full">
      {/* Contacts List */}
      <div className="w-80 min-w-[320px] border-r border-border flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">通讯录</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <Input
              placeholder="搜索用户添加好友"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-12 bg-background-secondary"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">
                  搜索结果
                </h3>
                {searchResults.map((u) => (
                  <div
                    key={u._id}
                    className="flex items-center p-3 rounded-12 hover:bg-background-secondary"
                  >
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {u.name || u.username}
                      </p>
                      <p className="text-sm text-text-tertiary truncate">
                        @{u.username}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-12"
                      onClick={() => handleAddClick(u.username)}
                    >
                      添加
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !isLoading && (
              <div className="text-center py-4 text-text-tertiary">
                <p className="text-sm">未找到用户</p>
              </div>
            )}

            {/* Friends List */}
            {!searchQuery && (
              <>
                <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">
                  好友列表
                </h3>
                {friends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center p-3 rounded-12 hover:bg-background-secondary group"
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {friend.user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <StatusIndicator
                        username={friend.user.username}
                        size="sm"
                        className="absolute -bottom-0.5 right-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {friend.user.name || friend.user.username}
                      </p>
                      <p className="text-sm text-text-tertiary truncate">
                        @{friend.user.username}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full"
                        onClick={() => handleStartChat(friend.user.username)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 rounded-full"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {friends.length === 0 && (
                  <div className="text-center py-8 text-text-tertiary">
                    <p>暂无好友</p>
                    <p className="text-sm mt-1">搜索用户名添加好友</p>
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Panel */}
      <div className="flex-1 flex items-center justify-center bg-background-secondary">
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-lg font-medium">选择联系人查看详情</p>
          <p className="text-sm mt-1">从左侧列表选择好友</p>
        </div>
      </div>

      {/* Friend Request Dialog */}
      {showRequestDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-16 p-6 w-[400px] shadow-lg">
            <h3 className="text-lg font-semibold text-text-primary mb-4">发送好友请求</h3>
            <p className="text-sm text-text-secondary mb-4">
              向 <span className="font-medium">@{selectedUsername}</span> 发送好友请求
            </p>
            <Input
              placeholder="输入验证消息"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowRequestDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleSendRequest}>
                发送
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;