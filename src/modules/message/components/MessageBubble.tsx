import React, { useState } from 'react';
import { MoreHorizontal, Reply, Forward, Trash2, Copy, Pin, Star } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/message';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showAvatar?: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onDelete?: (messageId: string) => void;
  onCopy?: (text: string) => void;
  onPin?: (messageId: string) => void;
  onStar?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  showAvatar = true,
  onReply,
  onForward,
  onDelete,
  onCopy,
  onPin,
  onStar,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    switch (message.status) {
      case 'sending':
        return <span className="text-xs text-text-tertiary">发送中...</span>;
      case 'sent':
        return <span className="text-xs text-text-tertiary">已发送</span>;
      case 'delivered':
        return <span className="text-xs text-functional-success">已送达</span>;
      case 'read':
        return <span className="text-xs text-functional-success">已读</span>;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn('flex group', isMe ? 'justify-end' : 'justify-start')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn('flex items-end max-w-[70%]', isMe ? 'flex-row-reverse' : 'flex-row')}>
        {/* Avatar */}
        {showAvatar && !isMe && (
          <Avatar className="w-8 h-8 mr-2 mb-6">
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {message.u.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Message Content */}
        <div className={cn('relative', isMe ? 'ml-2' : 'mr-2')}>
          {/* Action Menu */}
          {isHovered && (
            <div className={cn(
              'absolute top-0 flex items-center space-x-1',
              isMe ? '-left-20' : '-right-20'
            )}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 rounded-full bg-background-secondary"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isMe ? 'end' : 'start'}>
                  {onReply && (
                    <DropdownMenuItem onClick={() => onReply(message)}>
                      <Reply className="w-4 h-4 mr-2" />
                      回复
                    </DropdownMenuItem>
                  )}
                  {onForward && (
                    <DropdownMenuItem onClick={() => onForward(message)}>
                      <Forward className="w-4 h-4 mr-2" />
                      转发
                    </DropdownMenuItem>
                  )}
                  {onCopy && (
                    <DropdownMenuItem onClick={() => onCopy(message.msg)}>
                      <Copy className="w-4 h-4 mr-2" />
                      复制
                    </DropdownMenuItem>
                  )}
                  {onPin && (
                    <DropdownMenuItem onClick={() => onPin(message._id)}>
                      <Pin className="w-4 h-4 mr-2" />
                      {message.pinned ? '取消置顶' : '置顶'}
                    </DropdownMenuItem>
                  )}
                  {onStar && (
                    <DropdownMenuItem onClick={() => onStar(message._id)}>
                      <Star className="w-4 h-4 mr-2" />
                      {message.starred?.length ? '取消收藏' : '收藏'}
                    </DropdownMenuItem>
                  )}
                  {isMe && onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(message._id)}
                        className="text-functional-error"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Bubble */}
          <div
            className={cn(
              'px-4 py-2 rounded-16',
              isMe
                ? 'bg-primary text-primary-foreground rounded-br-4'
                : 'bg-background-secondary text-text-primary rounded-bl-4'
            )}
          >
            {/* Reply Reference */}
            {message.msg.includes('[REPLY]') && (
              <div className="mb-2 p-2 bg-black/10 rounded-8 text-sm opacity-80">
                <p className="line-clamp-2">{message.msg.split('[REPLY]')[1]?.split('[/REPLY]')[0]}</p>
              </div>
            )}

            {/* Message Text */}
            <p className="whitespace-pre-wrap break-words">
              {message.msg.replace(/\[REPLY\].*?\[\/REPLY\]/g, '').trim()}
            </p>

            {/* Reactions */}
            {message.reactions && Object.keys(message.reactions).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(message.reactions).map(([emoji, { usernames }]) => (
                  <span
                    key={emoji}
                    className="px-2 py-0.5 bg-black/10 rounded-full text-xs"
                  >
                    {emoji} {usernames.length}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time and Status */}
          <div className={cn(
            'flex items-center mt-1 space-x-1',
            isMe ? 'justify-end' : 'justify-start'
          )}>
            <span className="text-xs text-text-tertiary">
              {formatTime(message.ts)}
            </span>
            {isMe && getStatusIcon()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;