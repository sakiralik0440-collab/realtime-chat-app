import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import theme from '../theme';
import { useState } from 'react';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      style={{background: theme.gradient}}
      className="text-white px-4 py-3 flex items-center justify-between shadow-lg relative"
    >
      {/* Left — App name only */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-xl bg-white bg-opacity-20 flex items-center justify-center text-lg">
    {theme.logo}
  </div>
  <div>
    <h1 className="text-base font-bold tracking-wide">{theme.name}</h1>
    <p className="text-xs opacity-60">{theme.tagline}</p>
  </div>
</div>
        <p className="text-xs opacity-70 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
          Online
        </p>
      </div>

      {/* Right — Avatar only */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-9 h-9 rounded-full bg-white bg-opacity-20 border-2 border-white border-opacity-40 flex items-center justify-center text-sm font-bold overflow-hidden"
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          user?.username?.charAt(0).toUpperCase()
        )}
      </button>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-2 top-14 bg-white rounded-2xl shadow-xl z-50 overflow-hidden w-48">

            {/* User info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>

            {/* Profile */}
            <button
              onClick={() => { navigate('/profile'); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <span>👤</span> My Profile
            </button>

            {/* Dark mode */}
            <button
              onClick={() => { toggleTheme(); setShowMenu(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100"
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100"
            >
              <span>🚪</span> Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;