const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');

let users = [];
let groups = [];

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // ... (di chuyển toàn bộ logic socket.on vào đây)
        socket.emit('users', users);
        socket.emit('groups', groups);

        socket.on('join', (username) => {
            // ...
            console.log(`${username} joined with socket ID: ${socket.id}`);
            socket.username = username;
            if (!users.find((u) => u.username === username)) {
                users.push({ id: socket.id, username });
            }
            io.emit('users', users);
            socket.emit('groups', groups);
        });

        socket.on('createGroup', async ({ groupName, members }) => {
            // ...
            const groupId = uuidv4();
            const newGroup = { id: groupId, name: groupName, members: [socket.username, ...members] };
            groups.push(newGroup);
            io.emit('groups', groups);

            newGroup.members.forEach((member) => {
                const memberSocket = users.find((u) => u.username === member);
                if (memberSocket) {
                    //io.to(memberSocket.id).sockets.sockets.get(memberSocket.id).join(groupId);
                    io.to(memberSocket.id).emit('message', {
                        room: groupId,
                        user: 'Hệ thống',
                        text: `${socket.username} đã tạo nhóm "${groupName}"`,
                        timestamp: new Date(),
                    });
                }
            });

            // Lưu thông báo tạo nhóm vào DB
            const systemMessage = new Message({
                room: groupId,
                user: 'Hệ thống',
                text: `${socket.username} đã tạo nhóm "${groupName}"`,
                isGroup: true,
            });
            await systemMessage.save();
        });

        socket.on('sendMessage', async ({ recipient, message, isGroup }) => {
            // ...
            let room;
            const timestamp = new Date();
            if (isGroup) {
                room = recipient;
                const group = groups.find((g) => g.id === recipient);
                if (group && group.members.includes(socket.username)) {
                    const msg = new Message({
                        room,
                        user: socket.username,
                        text: message,
                        isGroup: true,
                    });
                    await msg.save();
                    io.to(room).emit('message', {
                        room,
                        user: socket.username,
                        text: message,
                        timestamp: msg.timestamp,
                    });
                }
            } else {
                const recipientSocket = users.find((u) => u.username === recipient);
                const usersSorted = [socket.username, recipient].sort();
                room = usersSorted.join('-');
                socket.join(room);

                const msg = new Message({
                    room,
                    user: socket.username,
                    text: message,
                    timestamp,
                    isGroup: false,
                });
                await msg.save();

                // Gửi tin nhắn đến người gửi để tự cập nhật UI
                socket.emit('message', msg);

                // io.to(room).emit('message', {
                //   room,
                //   user: socket.username,
                //   text: message,
                //   timestamp: msg.timestamp,
                // });

                if (recipientSocket) {
                    io.to(recipientSocket.id).emit('message', msg);
                }
            }
        });

        socket.on('getMessageHistory', async ({ room, isGroup }) => {
            // ...
            const messages = await Message.find({ room, isGroup }).sort({ timestamp: 1 }).limit(50);
            socket.emit('messageHistory', messages);
        });

        socket.on('disconnect', () => {
            // ...
            if (socket.username) {
                users = users.filter((u) => u.username !== socket.username);
                io.emit('users', users);
                console.log(`${socket.username} disconnected`);
            }
        });
    });
};