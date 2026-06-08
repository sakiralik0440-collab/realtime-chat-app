const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

const socketHandler = (io) => {
  const onlineUsers = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user_online', async (userId) => {
      onlineUsers[userId] = socket.id;
      await User.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date()
      });
      io.emit('online_users', Object.keys(onlineUsers));
      io.emit('user_status_change', { userId, isOnline: true });
      console.log('Online users:', Object.keys(onlineUsers));
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left room ${roomId}`);
    });

    socket.on('send_message', async (data) => {
      try {
        const { roomId, senderId, content } = data;

        // Get room members
        const room = await Room.findById(roomId).populate('members', '_id');

        // unreadBy = all members except sender
        const unreadBy = room.members
          .map(m => m._id)
          .filter(id => id.toString() !== senderId);

        const newMessage = new Message({
          room: roomId,
          sender: senderId,
          content,
          unreadBy
        });

        await newMessage.save();
        await Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id });

        const populatedMessage = await Message.findById(newMessage._id)
          .populate('sender', 'username email');

        io.to(roomId).emit('receive_message', populatedMessage);

        // Notify all members
        room.members.forEach(member => {
          const memberSocketId = onlineUsers[member._id.toString()];
          if (memberSocketId) {
            io.to(memberSocketId).emit('new_chat_notification', { roomId });
          }
        });

      } catch (err) {
        console.log('Socket message error:', err.message);
      }
    });

    socket.on('typing', (data) => {
      const { roomId, username } = data;
      socket.to(roomId).emit('user_typing', username);
    });

    socket.on('stop_typing', (roomId) => {
      socket.to(roomId).emit('user_stop_typing');
    });

    // Message reaction
socket.on('message_reaction', async (data) => {
  try {
    const { messageId, emoji, roomId, userId, username } = data;

    const message = await Message.findById(messageId);
    if (!message) return;

    const existingReaction = message.reactions.find(
      r => r.user.toString() === userId && r.emoji === emoji
    );

    if (existingReaction) {
      message.reactions = message.reactions.filter(
        r => !(r.user.toString() === userId && r.emoji === emoji)
      );
    } else {
      message.reactions = message.reactions.filter(
        r => r.user.toString() !== userId
      );
      message.reactions.push({ emoji, user: userId, username });
    }

    await message.save();

    const updatedMessage = await Message.findById(message._id)
      .populate('sender', 'username email');

    // Send updated message to everyone in room
    io.to(roomId).emit('message_updated', updatedMessage);

  } catch (err) {
    console.log('Reaction error:', err.message);
  }
});

    socket.on('disconnect', async () => {
      const userId = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );

      if (userId) {
        delete onlineUsers[userId];
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date()
        });
        io.emit('online_users', Object.keys(onlineUsers));
        io.emit('user_status_change', { userId, isOnline: false, lastSeen: new Date() });
        console.log('User disconnected:', userId);
      }
    });
  });
};

module.exports = socketHandler;