import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Register from './pages/Register';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/chat" />} />
        <Route path="/login" element={<div>Login Page - Coming Day 9</div>} />
        <Route path="/chat" element={user ? <div>Chat Page - Coming Day 13</div> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;