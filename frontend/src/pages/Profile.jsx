import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import theme from '../theme';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      let avatarUrl = user?.avatar || '';

      // Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('image', avatarFile);
        const uploadRes = await api.post('/users/upload-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = uploadRes.data.avatarUrl;
      }

      const res = await api.put('/users/profile', { username, phone, avatar: avatarUrl });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setSuccess('Profile updated successfully! ✅');
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
      <div style={{background: theme.gradient}} className="px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/chat')} className="text-white text-2xl">←</button>
        <h1 className="text-white font-bold text-lg">My Profile</h1>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg"
              style={{background: theme.gradient}}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Camera icon to change avatar */}
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer shadow-md text-white"
              style={{background: theme.gradientTwo}}
            >
              📷
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-gray-400 text-sm mt-3">Tap 📷 to change photo</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">{success}</div>}
          {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm">{error}</div>}

          <div>
            <label className="block text-gray-600 text-sm mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          <div>
            <label className="block text-gray-600 text-sm mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
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
            style={{background: theme.gradient}}
            className="w-full text-white py-2.5 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

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