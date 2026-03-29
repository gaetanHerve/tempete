const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);


// En prod : définir ALLOWED_ORIGINS="https://mon-domaine.com"
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ["http://192.168.1.39:4200", "http://localhost:4200","http://localhost:4201", "http://192.168.1.39:4201"];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  }
});

// roomCode -> { player1: socketId, player2: socketId | null }
const rooms = new Map();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  socket.on('create-game', () => {
    const roomCode = generateRoomCode();
    rooms.set(roomCode, { player1: socket.id, player2: null });
    socket.join(roomCode);
    console.log(`Room ${roomCode} created by ${socket.id}`);
    socket.emit('game-created', { roomCode, playerNumber: 'player1' });
  });

  socket.on('join-game', (roomCode) => {
    const room = rooms.get(roomCode);
    if (!room) {
      socket.emit('join-error', { message: 'Partie introuvable.' });
      return;
    }
    if (room.player2) {
      socket.emit('join-error', { message: 'La partie est déjà complète.' });
      return;
    }
    room.player2 = socket.id;
    socket.join(roomCode);
    console.log(`${socket.id} joined room ${roomCode} as player2`);
    socket.emit('game-joined', { roomCode, playerNumber: 'player2' });
    socket.to(roomCode).emit('opponent-joined');
  });

  socket.on('new-game', ({ roomCode, game }) => {
    const socketsInRoom = io.sockets.adapter.rooms.get(roomCode);
    console.log(`new-game in room ${roomCode} from ${socket.id} | sockets in room:`, [...(socketsInRoom ?? [])]);
    socket.to(roomCode).emit('new-game', game);
  });

  socket.on('disconnect', (reason) => {
    console.log('client disconnected', socket.id, reason);
    for (const [code, room] of rooms.entries()) {
      if (room.player1 === socket.id || room.player2 === socket.id) {
        socket.to(code).emit('opponent-disconnected');
        rooms.delete(code);
        console.log(`Room ${code} deleted`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
