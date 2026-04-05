import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocket } from './services/socketService';

const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(env.PORT, () => {
  console.log(`🚀 Backend server running on port ${env.PORT}`);
});
