import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { messageApi } from '@/api/message';
import type { Message } from '@/types/message';

interface MessageSearchProps {
  roomId: string;
  onSelectMessage?: (message: Message) => void;
  onClose?: () => void;
}

const MessageSearch: React.FC<MessageSearchProps> = ({ roomId, onSelectMessage, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const messages = await messageApi.searchMessages(roomId, searchQuery);
      setResults(messages);
    } catch (error) {
      console.error('Failed to search messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="bg-functional-warning/30 font-medium">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="w-80 bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">搜索消息</h3>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-12">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-border">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary w-4 h-4" />
            <Input
              placeholder="搜索消息内容"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 rounded-12"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading} className="rounded-12">
            搜索
          </Button>
        </div>
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-8 text-text-tertiary">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p>搜索中...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((message) => (
                <div
                  key={message._id}
                  className="p-3 rounded-12 hover:bg-background-secondary cursor-pointer transition-colors"
                  onClick={() => onSelectMessage?.(message)}
                >
                  <div className="flex items-center mb-2">
                    <Avatar className="w-6 h-6 mr-2">
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {message.u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm text-text-primary">
                      {message.u.name || message.u.username}
                    </span>
                    <span className="text-xs text-text-tertiary ml-auto">
                      {formatTime(message.ts)}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {highlightText(message.msg, searchQuery)}
                  </p>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-8 text-text-tertiary">
              <p>未找到相关消息</p>
            </div>
          ) : (
            <div className="text-center py-8 text-text-tertiary">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>输入关键词搜索消息</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageSearch;