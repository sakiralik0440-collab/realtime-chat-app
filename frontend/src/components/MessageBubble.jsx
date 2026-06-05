import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const MessageBubble = ({ message, onDeleteMessage, onEditMessage }) => {
  const { user } = useAuth();
  const isMyMessage = message.sender._id === user?.id;
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const longPressTimer = useRef(null);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Long press handlers
  const handlePressStart = () => {
    if (!isMyMessage) return;
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

  const renderContent = () => {
    if (message.isDeleted) {
      return (
        <p className={`text-sm italic ${isMyMessage ? 'text-white text-opacity-70' : 'text-gray-400'}`}>
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
            <button
              onClick={handleEditSubmit}
              className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full font-medium"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-white text-opacity-70 px-2 py-1"
            >
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
          <span className={`text-xs ml-1 ${isMyMessage ? 'text-white text-opacity-60' : 'text-gray-400'}`}>
            (edited)
          </span>
        )}
      </p>
    );
  };

  return (
    <div className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>

        {!isMyMessage && (
          <span className="text-xs text-gray-400 mb-1 ml-2">
            {message.sender.username}
          </span>
        )}

        {/* Long press menu */}
        {showMenu && isMyMessage && (
          <div className="mb-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {!message.isDeleted && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
              >
                ✏️ Edit
              </button>
            )}
            {!message.isDeleted && (
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
          className={`px-4 py-2 rounded-2xl select-none ${
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

        <span className="text-xs text-gray-400 mt-1 mx-2">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;