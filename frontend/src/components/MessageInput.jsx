import { useState, useRef } from 'react';
import api from '../utils/api';

const MessageInput = ({ onSendMessage, onTyping, activeRoomId }) => {
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const imageRef = useRef(null);
  const fileRef = useRef(null);

  const handleChange = (e) => {
    setMessage(e.target.value);
    onTyping();
  };

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('roomId', activeRoomId);
      await api.post('/messages/send-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.log('Image upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', activeRoomId);
      await api.post('/messages/send-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      console.log('File upload error:', err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2">

      {/* Hidden file inputs */}
      <input type="file" ref={imageRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={fileRef} onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.zip" className="hidden" />

      {/* Image button */}
      <button
        onClick={() => imageRef.current.click()}
        disabled={uploading}
        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>

      {/* File button */}
      <button
        onClick={() => fileRef.current.click()}
        disabled={uploading}
        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>

      {/* Text input */}
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={uploading ? 'Uploading...' : 'Type a message...'}
        disabled={uploading}
        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-300 transition disabled:opacity-50"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!message.trim() || uploading}
        style={{background: message.trim() ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#E5E7EB'}}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
};

export default MessageInput;