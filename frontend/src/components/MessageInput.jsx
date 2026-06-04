

import React, { useState } from 'react'

const MessageInput = () => {
    const [message,setMessage] = useState('');

    const handleChange = (e) =>{
        setMessage(e.target.value);
        onTyping(); //fire typing event
    };

    const handleSend = () =>{
        if (!message.trim()) return;
        onSendMessage(message);
        setMessage('');
    };

    const handleKeyPress = (e) =>{
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
  return (
   <div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-3">

      {/* Text input */}
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-300 transition"
      />

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!message.trim()}
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

export default MessageInput