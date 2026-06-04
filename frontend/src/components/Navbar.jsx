import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{background: 'linear-gradient(135deg, #4F46E5, #7C3AED)'}}
      className="text-white px-4 py-3 flex items-center justify-between shadow-lg">

      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white bg-opacity-20 flex items-center justify-center">
          <span className="text-white text-lg">💬</span>
        </div>
        <div>
          <h1 className="text-lg font-semibold">ChatApp</h1>
          <p className="text-xs text-white text-opacity-70">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>
            Online
          </p>
        </div>
      </div>

      {/* Right — Avatar + Logout */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 border border-white border-opacity-40 flex items-center justify-center text-sm font-medium">
          {user?.username?.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm hidden sm:block">{user?.username}</span>
        <button
          onClick={handleLogout}
          className="text-sm px-3 py-1 rounded-full border border-white border-opacity-30 bg-white bg-opacity-15 hover:bg-opacity-25 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;