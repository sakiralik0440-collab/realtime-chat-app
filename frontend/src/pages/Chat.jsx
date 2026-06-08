import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import MessageInput from '../components/MessageInput';
import GroupInfo from '../components/GroupInfo';
import { formatLastSeen } from '../utils/timeUtils';

const Chat = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [foundMember, setFoundMember] = useState(null);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [replyTo, setReplyTo] = useState(null);

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

    newSocket.on('message_updated', (updatedMessage) => {
  setMessages((prev) => prev.map(m =>
    m._id === updatedMessage._id ? updatedMessage : m
  )); 

  newSocket.on('messages_seen_update', ({ roomId }) => {
  if (activeRoom?._id === roomId) {
    setMessages((prev) => prev.map(m => ({ ...m, status: 'seen' })));
  }
});
});

    newSocket.on('new_chat_notification', async ({ roomId }) => {
      fetchContacts();
      fetchGroups();
      fetchUnreadCounts();
    });

    newSocket.on('user_status_change', ({ userId, isOnline, lastSeen }) => {
      setOnlineUsers((prev) => {
        if (isOnline) {
          return [...new Set([...prev, userId])];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
      setContacts((prev) => prev.map(c => {
        if (c.otherUserId?.toString() === userId) {
          return { ...c, isOnline, lastSeen };
        }
        return c;
      }));
    });

    newSocket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => newSocket.disconnect();
  }, [user.id]);

  useEffect(() => {
    fetchContacts();
    fetchGroups();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/users/contacts');
      setContacts(res.data);
    } catch (err) {
      console.log('Error fetching contacts:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/rooms/groups');
      setGroups(res.data);
    } catch (err) {
      console.log('Error fetching groups:', err);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/messages/unread/counts');
      setUnreadCounts(res.data);
    } catch (err) {
      console.log('Error fetching unread counts:', err);
    }
  };

  const handleRoomSelect = async (room) => {
    if (activeRoom && socket) {
      socket.emit('leave_room', activeRoom._id);
    }
    setActiveRoom(room);
    setMessages([]);
    setShowGroupInfo(false);
    setShowAddMember(false);
    setFoundMember(null);

    // Mark messages as read
    try {
      await api.post(`/messages/read/${room._id}`);
      setUnreadCounts((prev) => {
        const updated = { ...prev };
        delete updated[room._id];
        return updated;
      });
    } catch (err) {
      console.log('Error marking as read:', err);
    }

    if (socket) {
      socket.emit('join_room', room._id);
    }
    socket.emit('messages_seen', {
  roomId: room._id,
  userId: user.id
});
    try {
      const res = await api.get(`/messages/${room._id}`);
      setMessages(res.data);
    } catch (err) {
      console.log('Error fetching messages:', err);
    }
  };

  const handleSendMessage = (content, replyToId) => {
  if (!activeRoom || !socket) return;
  socket.emit('send_message', {
    roomId: activeRoom._id,
    senderId: user.id,
    content,
    replyTo: replyToId || null
  });
  socket.emit('stop_typing', activeRoom._id);
  setReplyTo(null);
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

  const handleNewChat = (room) => {
    setContacts((prev) => {
      const exists = prev.find(c => c._id === room._id);
      if (exists) return prev;
      return [room, ...prev];
    });
    handleRoomSelect(room);
  };

  const handleCreateGroup = (room) => {
    setGroups((prev) => [room, ...prev]);
    handleRoomSelect(room);
  };

  const handleSearchMember = async () => {
    if (!searchMember.trim()) return;
    try {
      const res = await api.get(`/users/search/${searchMember}`);
      setFoundMember(res.data);
    } catch (err) {
      console.log('User not found');
      setFoundMember(null);
    }
  };

  const handleAddMember = async () => {
    if (!foundMember || !activeRoom) return;
    try {
      const res = await api.post('/rooms/add-member', {
        roomId: activeRoom._id,
        userId: foundMember._id
      });
      setActiveRoom(res.data.room);
      setFoundMember(null);
      setSearchMember('');
      setShowAddMember(false);
      alert(`${foundMember.username} added to group!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not add member');
    }
  };

  const handleDeleteMessage = (messageId, updatedMessage) => {
    setMessages((prev) => prev.map(m =>
      m._id === messageId ? updatedMessage : m
    ));
  };

  const handleEditMessage = (messageId, updatedMessage) => {
    setMessages((prev) => prev.map(m =>
      m._id === messageId ? updatedMessage : m
    ));
  };

  const handleDeleteRoom = async () => {
    if (!activeRoom) return;
    const confirm = window.confirm(`Delete "${activeRoom.name}"? This cannot be undone!`);
    if (!confirm) return;
    try {
      await api.delete(`/rooms/${activeRoom._id}`);
      if (activeRoom.isGroup) {
        setGroups((prev) => prev.filter(g => g._id !== activeRoom._id));
      } else {
        setContacts((prev) => prev.filter(c => c._id !== activeRoom._id));
      }
      setActiveRoom(null);
      setMessages([]);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete');
    }
  };

  const handleMemberRemoved = (updatedRoom) => {
    setActiveRoom(updatedRoom);
    setGroups((prev) => prev.map(g => g._id === updatedRoom._id ? updatedRoom : g));
  };

  const handleDeleteGroup = (roomId) => {
    setGroups((prev) => prev.filter(g => g._id !== roomId));
    setActiveRoom(null);
    setMessages([]);
    setShowGroupInfo(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          contacts={contacts}
          groups={groups}
          activeRoom={activeRoom}
          onRoomSelect={handleRoomSelect}
          onNewChat={handleNewChat}
          onCreateGroup={handleCreateGroup}
          unreadCounts={unreadCounts}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeRoom ? (
            <>
              {/* Chat header */}
              <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div
                    style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-medium text-sm"
                  >
                    {activeRoom.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activeRoom.name}</p>
                    <p className="text-xs text-purple-500">
                      {activeRoom.isGroup
                        ? `${activeRoom.members?.length} members`
                        : activeRoom.isOnline
                          ? '🟢 Online'
                          : formatLastSeen(activeRoom.lastSeen)
                      }
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  {activeRoom.isGroup && (
                    <>
                      <button
                        onClick={() => setShowAddMember(!showAddMember)}
                        style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                        className="text-white text-xs px-3 py-1.5 rounded-full"
                      >
                        + Add Member
                      </button>
                      <button
                        onClick={() => setShowGroupInfo(!showGroupInfo)}
                        className="text-purple-600 text-xs px-3 py-1.5 rounded-full border border-purple-200 hover:bg-purple-50 transition"
                      >
                        👥 Info
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleDeleteRoom}
                    className="text-red-400 text-xs px-3 py-1.5 rounded-full border border-red-200 hover:bg-red-50 transition"
                  >
                    🗑 Delete
                  </button>
                </div>
              </div>

              {/* Add member panel */}
              {activeRoom.isGroup && showAddMember && (
                <div className="px-6 py-3 bg-purple-50 border-b border-purple-100 flex gap-2">
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="flex-1 bg-white rounded-full px-4 py-2 text-sm outline-none border border-purple-200 focus:ring-2 focus:ring-purple-300"
                  />
                  <button
                    onClick={handleSearchMember}
                    style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                    className="px-4 py-2 rounded-full text-white text-sm"
                  >
                    Search
                  </button>
                </div>
              )}

              {/* Found member to add */}
              {activeRoom.isGroup && foundMember && (
                <div className="px-6 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    >
                      {foundMember.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{foundMember.username}</p>
                      <p className="text-xs text-gray-400">{foundMember.phone}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleAddMember}
                    style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
                    className="text-white text-xs px-3 py-1.5 rounded-full"
                  >
                    Add
                  </button>
                </div>
              )}

              {/* Messages + Group Info side by side */}
              <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
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
                        <MessageBubble
  key={message._id}
  message={message}
  onDeleteMessage={handleDeleteMessage}
  onEditMessage={handleEditMessage}
  socket={socket}
  activeRoomId={activeRoom._id}
  onReply={(msg) => setReplyTo(msg)}
/>
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
  activeRoomId={activeRoom._id}
  replyTo={replyTo}
  onCancelReply={() => setReplyTo(null)}
/>
                </div>

                {/* Group Info Panel */}
                {showGroupInfo && activeRoom?.isGroup && (
                  <GroupInfo
                    room={activeRoom}
                    onClose={() => setShowGroupInfo(false)}
                    onDeleteGroup={handleDeleteGroup}
                    onMemberRemoved={handleMemberRemoved}
                  />
                )}
              </div>
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
                <p className="text-gray-400 text-sm mt-1">Search a contact or select a chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;