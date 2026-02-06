import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/src/store/authStore';

const resolveSocketUrl = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
  return backendUrl.replace(/\/api\/v1\/?$/, '');
};

export interface ChatSocketHandlers {
  onMessage?: (message: any) => void;
  onTyping?: (payload: { userId: string; isTyping: boolean }) => void;
}

export const useChatSocket = (handlers?: ChatSocketHandlers) => {
  const token = useAuthStore((state) => state.token);
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<ChatSocketHandlers | undefined>(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

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

    const handleMessage = (payload: any) => {
      handlersRef.current?.onMessage?.(payload);
    };
    const handleTyping = (payload: any) => {
      handlersRef.current?.onTyping?.(payload);
    };

    socket.on('chat:new_message', handleMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:new_message', handleMessage);
      socket.off('chat:typing', handleTyping);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return socketRef;
};
