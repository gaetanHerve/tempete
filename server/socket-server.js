const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:4200", "http://localhost:4201"],
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('client connected', socket.id);

  socket.on('new-game', (game) => {
    console.log('new-game received from', socket.id);
    // Broadcast to all other clients
    socket.broadcast.emit('new-game', game);
  });

  socket.on('new-user', (user) => {
    console.log('new-user', user);
    socket.broadcast.emit('new-user', user);
  });

  socket.on('disconnect', (reason) => {
    console.log('client disconnected', socket.id, reason);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});
