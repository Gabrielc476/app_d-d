import { io, Socket } from "socket.io-client";

// Configuração do cliente Socket.IO
const socket: Socket = io(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  }
);

export default socket;
