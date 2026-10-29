import { Server as HTTPServer } from "http";
import { Server } from "socket.io";
import { verifyToken } from "./jwt";

let io: Server | null = null;

export function initSocket(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate each connection using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const payload = verifyToken(token);
      (socket as any).userId = payload.userId;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket as any).userId;
    socket.join(`user:${userId}`);
    console.log(`🔌 User connected: ${userId}`);
  });

  return io;
}

export function emitToUser(userId: string, event: string, payload: any) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}