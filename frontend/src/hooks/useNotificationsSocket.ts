import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/src/hooks/queries/keys';
import { useAuthStore } from '@/src/store/authStore';

const NOTIFICATION_NEW_EVENT = 'notification:new';

const resolveSocketUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  return backendUrl.replace(/\/api\/v1\/?$/, '');
};

export const useNotificationsSocket = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(resolveSocketUrl(), {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    const handleNotification = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unread() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    };

    socket.on(NOTIFICATION_NEW_EVENT, handleNotification);

    return () => {
      socket.off(NOTIFICATION_NEW_EVENT, handleNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, queryClient]);
};
