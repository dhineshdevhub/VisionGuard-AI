import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
  io = new SocketServer(server, {
    cors: {
      origin: '*', // Adjust for production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

export const broadcastIncident = (incidentData: any) => {
  if (io) {
    io.emit('incident:new', incidentData);
  }
};
