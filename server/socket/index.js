const Message = require('../models/Message');
const Room = require('../models/Room');
const User = require('../models/User');

const socketHandler = (io) => {
    //store online users
    const onlineUsers = {};

    io.on('connection' ,(socket) =>{
        console.log('User connected:' , socket.id);

        //users join with userid

        socket.on('user_online',async (userId) => {
            onlineUsers[userId] = socket.id;

            //update user online status in db
            await User.findByIdAndUpdate(userId, {isOnline:true});


            //broadcast to users who is online
            io.emit('online_users',Object.keys(onlineUsers));
            console.log('Online users:',Object.keys(onlineUsers));

        });

        //users join a chat room
        socket.on('join_room', (roomId) =>{
            socket.join(roomId);
            console.log(`User ${socket.id} joined room ${roomId}`);
        });

        //users leave a chat room
        socket.on('leave_room', (roomId) => {
             socket.leave(roomId);
             console.log(`User ${socket.id} left room ${roomId}`);
        });

        //users send a message

        socket.on('send_message',async (data) => {
            try{
                const {roomId,senderId,content} = data;

                //save msg to db
                const newMessage = new Message({
                    room :roomId,
                    sender :senderId,
                    content
                });

                await newMessage.save();

                //update last msg in room

                await  Room.findByIdAndUpdate(roomId, { lastMessage: newMessage._id});

                //populate sender details

                const populatedMessage = await Message.findById(newMessage._id)
                .populate('sender', 'username email');

                //send msg everyone in a room
                io.to(roomId).emit('receive_message' , populatedMessage);
              }catch(err){
                console.log('Socket message error:',err.message);
              }
        });

        //user is typing
        socket.on('typing', (data) =>{
            const {roomId ,username} = data;
            socket.to(roomId).emit('user_typing' ,username)
        });

        // User stopped typing
        socket.on('stop_typing', (roomId) => {
        socket.to(roomId).emit('user_stop_typing');
        });

        //user disconnects
        socket.on('disconnect',async () =>{
            //find which user disconnected
            const userId = Object.keys(onlineUsers).find(
                (key) => onlineUsers[key] === socket.id
            );

            if(userId) {
                delete onlineUsers[userId];

      
                // Update user offline status in DB
                await User.findByIdAndUpdate(userId, {isOnline : false});
               
                // Broadcast updated online users
                io.emit('online_users',Object.keys(onlineUsers));
                console.log('User disconnected:',userId);
            }
        });
    });
};

module.exports = socketHandler;
