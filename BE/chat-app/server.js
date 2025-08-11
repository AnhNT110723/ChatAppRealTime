const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Chat server is running');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a room
  socket.on('joinRoom', (username) => {
    socket.username = username;
    socket.broadcast.emit('message', {
      user: 'System',
      text: `${username} has joined the chat`,
      timestamp: new Date(),
    });
  });

  
  // Handle chat message
  socket.on('chatMessage', (msg) => {
    io.emit('message', {
      user: socket.username,
      text: msg,
      timestamp: new Date(),
    });
  });

   // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.username) {
      socket.broadcast.emit('message', {
        user: 'System',
        text: `${socket.username} has left the chat`,
        timestamp: new Date(),
      });
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});