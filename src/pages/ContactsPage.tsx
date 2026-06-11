import React, { useEffect, useState } from 'react';
import { Search, UserPlus, MoreHorizontal, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFriendStore } from '@/stores/friendStore';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';

const ContactsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    friends,
    friendRequests,
    searchResults,
    isLoading,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    blockUser,
    unblockUser,
    loadFriends,
    loadFriendRequests,
    clearSearchResults,
  } = useFriendStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, [loadFriends, loadFriendRequests]);

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
    // Navigate to chat with this user
    navigate('/chat');
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 w-full">
      {/* Contacts List */}
      <div className="w-80 min-w-[320px] border-r border-border flex flex-col bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">通讯录</h2>
            <Button variant="ghost" size="icon" className="rounded-12">
              <UserPlus className="w-5 h-5" />
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
            <TabsTrigger value="friends">好友</TabsTrigger>
            <TabsTrigger value="requests">
              申请
              {friendRequests.length > 0 && (
                <Badge className="ml-2 px-2 py-0.5 min-w-[20px] h-5 text-xs">
                  {friendRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1">
            <TabsContent value="friends" className="p-2">
              {/* Search Results */}
              {searchQuery && searchResults.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">
                    搜索结果
                  </h3>
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center p-3 rounded-12 hover:bg-background-secondary"
                    >
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-sm text-text-tertiary truncate">
                          @{user.username}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-12"
                        onClick={() => sendFriendRequest(user._id, '你好，我想加你为好友')}
                      >
                        添加
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Friends List */}
              <h3 className="text-sm font-medium text-text-secondary mb-2 px-2">
                好友列表
              </h3>
              {friends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center p-3 rounded-12 hover:bg-background-secondary group"
                >
                  <Avatar className="w-10 h-10 mr-3">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {friend.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
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

              {friends.length === 0 && !searchQuery && (
                <div className="text-center py-8 text-text-tertiary">
                  <p>暂无好友</p>
                  <p className="text-sm mt-1">搜索并添加好友</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="requests" className="p-2">
              {friendRequests.map((request) => (
                <Card key={request._id} className="mb-3">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {request.from.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-text-primary">
                            {request.from.name || request.from.username}
                          </p>
                          <span className="text-xs text-text-tertiary">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">
                          {request.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-3">
                          <Button
                            size="sm"
                            className="rounded-12"
                            onClick={() => acceptFriendRequest(request._id)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            同意
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-12"
                            onClick={() => rejectFriendRequest(request._id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {friendRequests.length === 0 && (
                <div className="text-center py-8 text-text-tertiary">
                  <p>暂无好友申请</p>
                </div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
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
    </div>
  );
};

export default ContactsPage;