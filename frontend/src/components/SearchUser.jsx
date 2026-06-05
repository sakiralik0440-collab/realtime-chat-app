import { useState } from 'react';
import api from '../utils/api';

const SearchUser = ({ onStartChat }) => {
  const [phone, setPhone] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  const handleSearch = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setFoundUser(null);

    try {
      const res = await api.get(`/users/search/${phone}`);
      setFoundUser(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'User not found');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!foundUser) return;
    setStarting(true);
    try {
      const res = await api.post('/users/start-chat', { userId: foundUser._id });
      onStartChat(res.data.room);
      setPhone('');
      setFoundUser(null);
    } catch (err) {
      setError('Could not start chat');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
        New Chat
      </p>

      {/* Search input */}
      <div className="flex gap-2">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search by name or phone..."
          className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs mt-2">{error}</p>
      )}

      {/* Found user card */}
      {foundUser && (
        <div className="mt-3 bg-purple-50 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium"
            >
              {foundUser.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{foundUser.username}</p>
              <p className="text-xs text-gray-400">{foundUser.phone}</p>
            </div>
          </div>
          <button
            onClick={handleStartChat}
            disabled={starting}
            style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
            className="text-white text-xs px-3 py-1.5 rounded-full disabled:opacity-50"
          >
            {starting ? '...' : 'Chat'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchUser;