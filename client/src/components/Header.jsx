import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.post('/api/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, clear local user state
      setUser(null);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo Area */}
        <div className="header-logo">
          <Link to="/play" className="logo-link">
            🎮 <span className="logo-text">Stuff Happens</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="header-nav">
          <Link 
            to="/play" 
            className={`nav-link ${isActive('/play') ? 'active' : ''}`}
          >
            🎯 Play
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            📊 Stats
          </Link>
          <Link 
            to="/demo" 
            className={`nav-link ${isActive('/demo') ? 'active' : ''}`}
          >
            🎮 Demo
          </Link>
          <Link 
            to="/rules" 
            className={`nav-link ${isActive('/rules') ? 'active' : ''}`}
          >
            📖 Rules
          </Link>
        </nav>

        {/* User Area */}
        <div className="header-user">
          <span className="user-welcome">
            👤 {user?.username}
          </span>
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="logout-btn"
          >
            {loading ? '🔄' : '🚪'} {loading ? 'Logging out...' : 'Log Out'}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu">
          <details className="mobile-dropdown">
            <summary className="mobile-menu-btn">
              ☰
            </summary>
            <div className="mobile-menu-content">
              <Link to="/play" className="mobile-nav-link">🎯 Play</Link>
              <Link to="/profile" className="mobile-nav-link">📊 Stats</Link>
              <Link to="/demo" className="mobile-nav-link">🎮 Demo</Link>
              <Link to="/rules" className="mobile-nav-link">📖 Rules</Link>
              <hr className="mobile-divider" />
              <div className="mobile-user-info">👤 {user?.username}</div>
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="mobile-logout-btn"
              >
                {loading ? '🔄 Logging out...' : '🚪 Log Out'}
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}