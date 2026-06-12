import React from 'react';
import { usePresenceStore } from '@/stores/presenceStore';

interface StatusIndicatorProps {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  username,
  size = 'md',
  showText = false,
  className = '',
}) => {
  const getStatus = usePresenceStore((s) => s.getStatus);
  const getStatusText = usePresenceStore((s) => s.getStatusText);
  const getStatusColor = usePresenceStore((s) => s.getStatusColor);

  const status = getStatus(username);
  const color = getStatusColor(status);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span className={`${sizeMap[size]} ${color} rounded-full ring-2 ring-background`} />
      {showText && (
        <span className="ml-1.5 text-xs text-text-tertiary">
          {getStatusText(status)}
        </span>
      )}
    </span>
  );
};

export default StatusIndicator;
