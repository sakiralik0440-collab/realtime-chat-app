import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';

const Chat = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('user_online', user.id);

    newSocket.on('receive_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('user_typing', (username) => {
      setTypingUser(username);
    });

    newSocket.on('user_stop_typing', () => {
      setTypingUser('');
    });

    return () => newSocket.disconnect();
  }, [user.id]);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms');
      setRooms(res.data);
    } catch (err) {
      console.log('Error fetching rooms:', err);
    }
  };

  const handleRoomSelect = async (room) => {
    if (activeRoom && socket) {
      socket.emit('leave_room', activeRoom._id);
    }
    setActiveRoom(room);
    setMessages([]);
    if (socket) {
      socket.emit('join_room', room._id);
    }
    try {
      const res = await api.get(`/messages/${room._id}`);
      setMessages(res.data);
    } catch (err) {
      console.log('Error fetching messages:', err);
    }
  };

  const handleSendMessage = (content) => {
    if (!activeRoom || !socket) return;
    socket.emit('send_message', {
      roomId: activeRoom._id,
      senderId: user.id,
      content
    });
    socket.emit('stop_typing', activeRoom._id);
  };

  const handleTyping = () => {
    if (!activeRoom || !socket) return;
    socket.emit('typing', {
      roomId: activeRoom._id,
      username: user.username
    });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', activeRoom._id);
    }, 2000);
  };

  const handleRoomCreate = (newRoom) => {
    setRooms((prev) => [newRoom, ...prev]);
    handleRoomSelect(newRoom);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          rooms={rooms}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          onRoomCreate={handleRoomCreate}
        />
        <div className="flex-1 flex flex-col">
          {activeRoom ? (
            <>
              <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-3 shadow-sm">
                <div
                  style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                >
                  {activeRoom.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activeRoom.name}</p>
                  <p className="text-xs text-purple-500">
                    {activeRoom.members?.length} members
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div
                        style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
                      >
                        <span className="text-white text-2xl">💬</span>
                      </div>
                      <p className="text-gray-500 text-sm">No messages yet</p>
                      <p className="text-gray-400 text-xs mt-1">Say hello!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble key={message._id} message={message} />
                  ))
                )}

                {typingUser && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-400">
                        {typingUser} is typing
                        <span className="animate-pulse">...</span>
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <MessageInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div
                  style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <span className="text-white text-3xl">💬</span>
                </div>
                <h2 className="text-gray-700 font-medium text-lg">Welcome to ChatApp</h2>
                <p className="text-gray-400 text-sm mt-1">Select a room to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;