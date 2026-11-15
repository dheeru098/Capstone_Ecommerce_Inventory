require('dotenv').config();
const http = require('node:http');
const { Server } = require('socket.io');
const User = require('./models/User');
const connectDatabase = require('./config/db');
const { verifyToken } = require('./utils/tokens');
const { attachEventHandlers } = require('./utils/events');
const app = require('./app');

async function start() {
  if (!process.env.JWT_ACCESS_SECRET || process.env.JWT_ACCESS_SECRET.length < 32 ||
      !process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32 ||
      process.env.JWT_ACCESS_SECRET === process.env.JWT_REFRESH_SECRET) {
    throw new Error('Set two distinct JWT secrets of at least 32 characters in .env');
  }
  await connectDatabase();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: process.env.CLIENT_ORIGIN === '*' ? '*' : (process.env.CLIENT_ORIGIN || '').split(',') } });

  io.use(async (socket, next) => {
    try {
      const payload = verifyToken(socket.handshake.auth.token, 'access');
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) throw new Error('Account is not available');
      socket.data.userId = String(user._id);
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);
    if (socket.data.role === 'admin') socket.join('role:admin');
    socket.emit('connection:ready', { userId: socket.data.userId });
  });

  attachEventHandlers(io);
  const port = Number(process.env.PORT) || 5000;
  server.listen(port, () => console.log(`API: http://localhost:${port}/api/health`));
}

start().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
