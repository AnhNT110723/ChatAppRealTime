const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));



// Import và sử dụng routes API
const authRoutes = require('./routes/auth');
app.use(authRoutes);

// Import và sử dụng logic Socket.IO
const socketHandler = require('./socket/handler');
socketHandler(io);




//   // Schema cho người dùng
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// const User = mongoose.model('User', userSchema);


// // Schema cho tin nhắn
// const messageSchema = new mongoose.Schema({
//   room: String, // ID phòng (nhóm hoặc riêng)
//   user: String, // Người gửi
//   text: String, // Nội dung tin nhắn
//   timestamp: { type: Date, default: Date.now }, // Thời gian gửi
//   isGroup: Boolean, // Là tin nhắn nhóm hay riêng
// });

// const Message = mongoose.model('Message', messageSchema);

// //================================== LOGIN / REGISTER ====================================

// // API đăng ký
// app.post('/register', async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword });
//     await user.save();
//     res.status(201).json({ message: 'Đăng ký thành công' });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error });
//   }
// });

// // API đăng nhập
// app.post('/login', async (req, res) => {
//    const { username, password } = req.body; 
//   try {
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(400).json({ message: 'Tên người dùng không tồn tại' });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: 'Mật khẩu không đúng' });
//     }
//     res.json({ username });
//   } catch (error) {
//     res.status(500).json({ message: 'Lỗi server', error });
//   }
// });


// //========================================================================================


// // Danh sách người dùng và nhóm
// let users = [];
// let groups = [];

// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.emit('users', users);
//   socket.emit('groups', groups);

//   socket.on('join', (username) => {
//     console.log(`${username} joined with socket ID: ${socket.id}`);
//     socket.username = username;
//     if (!users.find((u) => u.username === username)) {
//       users.push({ id: socket.id, username });
//     }
//     io.emit('users', users);
//     socket.emit('groups', groups);
//   });

//   socket.on('createGroup', async ({ groupName, members }) => {
//     const groupId = uuidv4();
//     const newGroup = { id: groupId, name: groupName, members: [socket.username, ...members] };
//     groups.push(newGroup);
//     io.emit('groups', groups);

//     newGroup.members.forEach((member) => {
//       const memberSocket = users.find((u) => u.username === member);
//       if (memberSocket) {
//        //io.to(memberSocket.id).sockets.sockets.get(memberSocket.id).join(groupId);
//         io.to(memberSocket.id).emit('message', {
//           room: groupId,
//           user: 'Hệ thống',
//           text: `${socket.username} đã tạo nhóm "${groupName}"`,
//           timestamp: new Date(),
//         });
//       }
//     });

//     // Lưu thông báo tạo nhóm vào DB
//     const systemMessage = new Message({
//       room: groupId,
//       user: 'Hệ thống',
//       text: `${socket.username} đã tạo nhóm "${groupName}"`,
//       isGroup: true,
//     });
//     await systemMessage.save();
//   });

//   socket.on('sendMessage', async ({ recipient, message, isGroup }) => {
//     let room;
//     const timestamp = new Date();
//     if (isGroup) {
//       room = recipient;
//       const group = groups.find((g) => g.id === recipient);
//       if (group && group.members.includes(socket.username)) {
//         const msg = new Message({
//           room,
//           user: socket.username,
//           text: message,
//           isGroup: true,
//         });
//         await msg.save();
//         io.to(room).emit('message', {
//           room,
//           user: socket.username,
//           text: message,
//           timestamp: msg.timestamp,
//         });
//       }
//     } else {
//       const recipientSocket = users.find((u) => u.username === recipient);
//       const usersSorted = [socket.username, recipient].sort();
//       room = usersSorted.join('-');
//       socket.join(room);

//       const msg = new Message({
//         room,
//         user: socket.username,
//         text: message,
//         timestamp,
//         isGroup: false,
//       });
//       await msg.save();

//        // Gửi tin nhắn đến người gửi để tự cập nhật UI
//       socket.emit('message', msg);

//       // io.to(room).emit('message', {
//       //   room,
//       //   user: socket.username,
//       //   text: message,
//       //   timestamp: msg.timestamp,
//       // });

//       if (recipientSocket) {
//         io.to(recipientSocket.id).emit('message', msg);
//       }
//     }
//   });

//   socket.on('getMessageHistory', async ({ room, isGroup }) => {
//     const messages = await Message.find({ room, isGroup }).sort({ timestamp: 1 }).limit(50);
//     socket.emit('messageHistory', messages);
//   });

//   socket.on('disconnect', () => {
//     if (socket.username) {
//       users = users.filter((u) => u.username !== socket.username);
//       io.emit('users', users);
//       console.log(`${socket.username} disconnected`);
//     }
//   });
// });

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});