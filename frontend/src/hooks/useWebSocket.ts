import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) return;

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_WS_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const emit = (event: string, data: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const off = (event: string, callback?: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  return { emit, on, off, isConnected: socketRef.current?.connected || false };
};