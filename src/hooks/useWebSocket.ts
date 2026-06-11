import { useEffect, useRef, useCallback } from 'react';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/stores/authStore';
import { useSocketStore } from '@/stores/socketStore';

export const useWebSocket = () => {
  const { isAuthenticated } = useAuthStore();
  const { isConnected, isReconnecting } = useSocketStore();
  const hasConnected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasConnected.current) {
      hasConnected.current = true;
      websocketService.connect().then(() => {
        useSocketStore.setState({ isConnected: true });
      }).catch((error) => {
        console.error('Failed to connect WebSocket:', error);
        hasConnected.current = false;
      });
    }

    return () => {
      if (!isAuthenticated) {
        websocketService.disconnect();
        useSocketStore.setState({ isConnected: false });
        hasConnected.current = false;
      }
    };
  }, [isAuthenticated]);

  const subscribeToRoom = useCallback((roomId: string) => {
    // Always track the subscription intent — the service will handle 
    // sending it once logged in, or immediately if already logged in
    websocketService.subscribeToRoom(roomId);
  }, []);

  const unsubscribeFromRoom = useCallback((roomId: string) => {
    websocketService.unsubscribeFromRoom(roomId);
  }, []);

  return {
    isConnected,
    isReconnecting,
    subscribeToRoom,
    unsubscribeFromRoom,
  };
};