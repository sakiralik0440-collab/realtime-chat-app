import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

const MessageBubble = ({ message, onDeleteMessage, onEditMessage, onReaction, socket, activeRoomId }) => {
  const { user } = useAuth();
  const isMyMessage = message.sender._id === user?.id;
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const longPressTimer = useRef(null);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);
 
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowMenu(true);
    }, 500);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleDelete = async () => {
    try {
      const res = await api.delete(`/messages/${message._id}`);
      onDeleteMessage(message._id, res.data);
      setShowMenu(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete message');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
    setEditContent(message.content);
  };

  const handleEditSubmit = async () => {
    if (!editContent.trim()) return;
    try {
      const res = await api.put(`/messages/${message._id}`, {
        content: editContent
      });
      onEditMessage(message._id, res.data);
      setIsEditing(false);
    } catch (err) {
      alert('Could not edit message');
    }
  };

  const handleReaction = (emoji) => {
    if (!socket || !activeRoomId) return;
    socket.emit('message_reaction', {
      messageId: message._id,
      emoji,
      roomId: activeRoomId,
      userId: user.id,
      username: user.username
    });
    setShowEmojiPicker(false);
    setShowMenu(false);
  };

  // Group reactions by emoji
  const groupedReactions = message.reactions?.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r.username);
    return acc;
  }, {});

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <p className={`text-sm italic ${isMyMessage ? 'text-white opacity-70' : 'text-gray-400'}`}>
          🚫 This message was deleted
        </p>
      );
    }

    if (isEditing) {
      return (
        <div className="flex flex-col gap-2">
          <input
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit()}
            className="text-sm text-gray-800 bg-white rounded-lg px-2 py-1 outline-none w-full"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleEditSubmit} className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full font-medium">
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="text-xs text-white opacity-70 px-2 py-1">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (message.messageType === 'image') {
      return (
        <img
          src={message.fileUrl}
          alt="shared"
          className="max-w-xs rounded-xl cursor-pointer"
          onClick={() => window.open(message.fileUrl, '_blank')}
        />
      );
    }

    if (message.messageType === 'file') {
      return (
          <a
          href={message.fileUrl}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center gap-2 text-sm underline ${isMyMessage ? 'text-white' : 'text-purple-600'}`}
        >
          <span>📎</span>
          <span>{message.fileName || 'Download file'}</span>
        </a>
      );
    }

    return (
      <p className="text-sm leading-relaxed">
        {message.content}
        {message.isEdited && !message.isDeleted && (
          <span className={`text-xs ml-1 ${isMyMessage ? 'text-white opacity-60' : 'text-gray-400'}`}>
            (edited)
          </span>
        )}
      </p>
    );
  };

  return (
    <div className={`flex mb-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>

        {!isMyMessage && (
          <span className="text-xs text-gray-400 mb-1 ml-2">
            {message.sender.username}
          </span>
        )}

        {/* Long press menu */}
        {showMenu && (
          <div className="mb-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-10">
            {/* Emoji reaction row */}
            <div className="flex gap-1 px-3 py-2 border-b border-gray-100">
              {EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {isMyMessage && !message.isDeleted && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                ✏️ Edit
              </button>
            )}
            {isMyMessage && !message.isDeleted && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 w-full text-left"
              >
                🗑️ Delete
              </button>
            )}
            <button
              onClick={() => setShowMenu(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 w-full text-left"
            >
              ✕ Cancel
            </button>
          </div>
        )}

        {/* Message bubble */}
        <div
          style={isMyMessage && message.messageType !== 'image' && !message.isDeleted
            ? {background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}
            : {}
          }
          className={`px-4 py-2 rounded-2xl select-none cursor-pointer ${
            isMyMessage
              ? message.messageType === 'image'
                ? ''
                : message.isDeleted
                  ? 'bg-gray-200 text-gray-500 rounded-br-sm'
                  : 'text-white rounded-br-sm shadow-md'
              : message.isDeleted
                ? 'bg-gray-100 text-gray-400 rounded-bl-sm'
                : 'bg-white text-gray-800 rounded-bl-sm shadow-sm border border-gray-100'
          }`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
        >
          {renderContent()}
        </div>

        {/* Reactions display */}
        {groupedReactions && Object.keys(groupedReactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 mx-1">
            {Object.entries(groupedReactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                title={users.join(', ')}
                className="bg-white border border-gray-200 rounded-full px-2 py-0.5 text-xs flex items-center gap-1 hover:bg-gray-50 shadow-sm"
              >
                <span>{emoji}</span>
                <span className="text-gray-500">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        <span className="text-xs text-gray-400 mt-1 mx-2">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;