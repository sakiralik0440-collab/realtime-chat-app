import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put('/users/profile', { username, phone });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
        className="px-4 py-4 flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/chat')}
          className="text-white text-2xl"
        >
          ←
        </button>
        <h1 className="text-white font-medium text-lg">Profile</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div
            style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
            className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-medium mb-3"
          >
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <p className="text-gray-500 text-sm">Your profile</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-600 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
            className="w-full text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;