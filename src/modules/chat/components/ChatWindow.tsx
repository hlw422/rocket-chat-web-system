import React, { useEffect, useRef, useState } from 'react';
import { Send, Smile, Paperclip, MoreHorizontal, Phone, Video, X, FileIcon, Loader2, Download, Image as ImageIcon, FileAudio, FileVideo, File, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';
import { usePresenceStore } from '@/stores/presenceStore';
import { useFriendStore } from '@/stores/friendStore';
import { chatApi } from '@/api/chat';
import { fileApi } from '@/api/file';
import EmojiPicker from '@/modules/message/components/EmojiPicker';
import MessageSearch from '@/modules/message/components/MessageSearch';
import StatusIndicator from '@/components/StatusIndicator';
import type { DirectMessageRoom } from '@/types/room';
import type { Message } from '@/types/message';

interface ChatWindowProps {
  room: DirectMessageRoom;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ room }) => {
  const { user } = useAuthStore();
  const { messages, loadMessages, sendMessage, addMessage, isLoading, otherUserLastSeen, updateOtherUserLastSeen } = useMessageStore();
  const { fetchUserStatus } = usePresenceStore();
  const { acceptFriendRequest } = useFriendStore();
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const roomMessages = messages[room._id] || [];
  const isAtBottomRef = useRef(true);

  const getOtherUser = () => {
    return room.usernames?.find(u => u !== user?.username) || '';
  };

  const otherUser = getOtherUser();

  // Fetch other user's status and poll every 5 seconds
  useEffect(() => {
    if (!otherUser) return;

    fetchUserStatus(otherUser);
    const interval = setInterval(() => fetchUserStatus(otherUser), 5000);

    return () => clearInterval(interval);
  }, [otherUser, fetchUserStatus]);

  // Poll other user's last seen to determine read status
  useEffect(() => {
    const fetchLastSeen = async () => {
      try {
        const subscription = await chatApi.getSubscription(room._id);
        if (subscription?.ls) {
          updateOtherUserLastSeen(room._id, new Date(subscription.ls));
        }
      } catch (error) {
        // Ignore errors
      }
    };

    fetchLastSeen();
    const interval = setInterval(fetchLastSeen, 3000);

    return () => clearInterval(interval);
  }, [room._id, updateOtherUserLastSeen]);

  useEffect(() => {
    loadMessages(room._id);
  }, [room._id, loadMessages]);

  useEffect(() => {
    if (roomMessages.length > 0) {
      // Always scroll to bottom when messages change (initial load or new message)
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 50);
    }
  }, [roomMessages]);

  // Handle scroll to track if user is at bottom
  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 50;
    }
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSelectSearchMessage = (message: Message) => {
    setHighlightMessageId(message._id);
    const el = document.getElementById(`msg-${message._id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => setHighlightMessageId(null), 3000);
  };

  const handleSend = async () => {
    const hasText = inputValue.trim().length > 0;
    const hasFile = selectedFile !== null;
    
    if (!hasText && !hasFile) return;

    try {
      if (hasFile) {
        setIsUploading(true);
        const uploadedMessage = await fileApi.uploadFile(room._id, selectedFile!, inputValue.trim() || undefined);
        setSelectedFile(null);
        setInputValue('');
        if (uploadedMessage) {
          addMessage(room._id, uploadedMessage);
        } else {
          await loadMessages(room._id);
        }
      } else {
        await sendMessage(room._id, inputValue.trim());
        setInputValue('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isCurrentUser = (message: Message) => {
    return message.u._id === user?._id;
  };

  const isFriendRequest = (message: Message) => {
    return message.msg?.startsWith('[FRIEND_REQUEST]');
  };

  const isFriendAccept = (message: Message) => {
    return message.msg?.startsWith('[FRIEND_ACCEPT]');
  };

  const getFriendRequestMessage = (message: Message) => {
    return message.msg?.replace('[FRIEND_REQUEST]', '') || '';
  };

  const handleAcceptFriendRequest = async () => {
    try {
      await acceptFriendRequest(otherUser);
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const isMessageRead = (message: Message): boolean => {
    if (message.u._id !== user?._id) return false;
    const lastSeen = otherUserLastSeen[room._id];
    if (!lastSeen) return false;
    const messageTime = new Date(message.ts).getTime();
    return messageTime <= lastSeen.getTime();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const shouldShowTimeDivider = (current: Message, previous: Message | null) => {
    if (!previous) return true;
    const currentTime = new Date(current.ts).getTime();
    const previousTime = new Date(previous.ts).getTime();
    return currentTime - previousTime > 5 * 60 * 1000; // 5 minutes
  };

  const getFileIcon = (attachment: any) => {
    if (attachment.image_url) return <ImageIcon className="w-5 h-5" />;
    if (attachment.audio_url) return <FileAudio className="w-5 h-5" />;
    if (attachment.video_url) return <FileVideo className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileUrl = (attachment: any, withAuth: boolean = false) => {
    const serverUrl = window.location.origin;
    const url = attachment.title_link || attachment.image_url || attachment.audio_url || attachment.video_url;
    if (!url) return null;
    let fullUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      fullUrl = `${serverUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    if (withAuth) {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');
      if (token && userId) {
        const separator = fullUrl.includes('?') ? '&' : '?';
        fullUrl = `${fullUrl}${separator}rc_token=${token}&rc_uid=${userId}`;
      }
    }
    return fullUrl;
  };

  const renderAttachments = (message: Message) => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment, idx) => {
          const fileUrl = getFileUrl(attachment, true);
          const isImage = attachment.image_url || (message.file?.type?.startsWith('image/'));
          
          if (isImage) {
            const imageUrl = attachment.image_url 
              ? getFileUrl({ image_url: attachment.image_url }, true)
              : fileUrl;
            return (
              <div key={idx} className="rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={attachment.title || '图片'}
                  className="max-w-full max-h-64 object-contain cursor-pointer"
                  onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                />
              </div>
            );
          }
          
          return (
            <div 
              key={idx} 
              className="flex items-center gap-2 p-2 rounded-lg bg-background/50 cursor-pointer hover:bg-background/80 transition-colors"
              onClick={() => fileUrl && window.open(fileUrl, '_blank')}
            >
              <div className="flex-shrink-0 text-text-secondary">
                {getFileIcon(attachment)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.title || '文件'}</p>
                {attachment.description && (
                  <p className="text-xs text-text-tertiary truncate">{attachment.description}</p>
                )}
              </div>
              <Download className="w-4 h-4 text-text-tertiary flex-shrink-0" />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-row h-full min-h-0 min-w-0 bg-background">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback className="bg-primary/20 text-primary">
              {otherUser.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-text-primary">{otherUser}</h3>
            <div className="flex items-center">
              <StatusIndicator username={otherUser} size="sm" showText />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showSearch ? "secondary" : "ghost"}
            size="icon"
            className="rounded-12"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-12">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-12">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-12">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4" onScroll={handleScroll}>
        <div className="space-y-4">
          {roomMessages.map((message, index) => {
            const isMe = isCurrentUser(message);
            const previousMessage = index > 0 ? roomMessages[index - 1] : null;
            const showTimeDivider = shouldShowTimeDivider(message, previousMessage);

            return (
              <React.Fragment key={message._id}>
                {showTimeDivider && (
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-text-tertiary bg-background-secondary px-3 py-1 rounded-full">
                      {formatTime(message.ts)}
                    </span>
                  </div>
                )}
                <div
                  id={`msg-${message._id}`}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} transition-all duration-500 ${
                    highlightMessageId === message._id ? 'bg-functional-warning/20 rounded-12' : ''
                  }`}
                >
                  <div
                    className={`flex ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%]`}
                  >
                    <Avatar className={`w-8 h-8 ${isMe ? 'ml-2' : 'mr-2'}`}>
                      <AvatarFallback className={`${isMe ? 'bg-primary text-primary-foreground' : 'bg-primary/20 text-primary'} text-xs`}>
                        {message.u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`px-4 py-2 rounded-16 ${
                        isMe
                          ? 'bg-primary text-primary-foreground rounded-br-4'
                          : 'bg-background-secondary text-text-primary rounded-bl-4'
                      }`}
                    >
                      {isFriendRequest(message) ? (
                        <div>
                          <p className="whitespace-pre-wrap break-words">{getFriendRequestMessage(message)}</p>
                          {!isMe && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs text-text-tertiary mb-2">好友请求</p>
                              <Button
                                size="sm"
                                className="rounded-12"
                                onClick={handleAcceptFriendRequest}
                              >
                                同意添加好友
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : isFriendAccept(message) ? (
                        <div>
                          <p className="whitespace-pre-wrap break-words">{message.msg?.replace('[FRIEND_ACCEPT]', '')}</p>
                          <p className="text-xs text-green-400 mt-1">已成为好友</p>
                        </div>
                      ) : (
                        <>
                          {message.msg && !(message.attachments?.some(a => a.image_url)) && (
                            <p className="whitespace-pre-wrap break-words">{message.msg}</p>
                          )}
                          {renderAttachments(message)}
                        </>
                      )}
                      {message.status === 'sending' && (
                        <span className="text-xs opacity-70 mt-1 block text-right">发送中...</span>
                      )}
                      {isMe && !isFriendRequest(message) && !isFriendAccept(message) && message.status !== 'sending' && !isMessageRead(message) && (
                        <span className="text-xs text-gray-400 mt-1 block text-right">未读</span>
                      )}
                      {isMe && !isFriendRequest(message) && !isFriendAccept(message) && isMessageRead(message) && (
                        <span className="text-xs text-blue-400 mt-1 block text-right">已读</span>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        {/* Selected file preview */}
        {selectedFile && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-background-secondary rounded-12">
            <FileIcon className="w-4 h-4 text-text-secondary flex-shrink-0" />
            <span className="text-sm text-text-primary truncate flex-1">{selectedFile.name}</span>
            <span className="text-xs text-text-tertiary">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 rounded-full"
              onClick={handleRemoveFile}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-12 mb-1"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="w-5 h-5 text-text-tertiary" />
            </Button>
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker 
                  onSelect={handleEmojiSelect} 
                  onClose={() => setShowEmojiPicker(false)} 
                />
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-12 mb-1"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Paperclip className="w-5 h-5 text-text-tertiary" />
          </Button>
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-12"
            rows={1}
            disabled={isUploading}
          />
          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && !selectedFile) || isUploading}
            className="rounded-12 px-4"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <MessageSearch
          roomId={room._id}
          onSelectMessage={handleSelectSearchMessage}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default ChatWindow;