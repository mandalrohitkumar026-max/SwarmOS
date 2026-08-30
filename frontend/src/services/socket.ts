import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to SwarmOS WebSocket Core');
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Disconnected from SwarmOS WebSocket Core');
    });
  }
  return socket;
}
