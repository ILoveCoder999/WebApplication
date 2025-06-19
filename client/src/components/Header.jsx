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
      // 即使登出失败，也清除本地用户状态
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
        {/* Logo区域 */}
        <div className="header-logo">
          <Link to="/play" className="logo-link">
            🎮 <span className="logo-text">Stuff Happens</span>
          </Link>
        </div>

        {/* 导航菜单 */}
        <nav className="header-nav">
          <Link 
            to="/play" 
            className={`nav-link ${isActive('/play') ? 'active' : ''}`}
          >
            🎯 游戏
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            📊 统计
          </Link>
          <Link 
            to="/demo" 
            className={`nav-link ${isActive('/demo') ? 'active' : ''}`}
          >
            🎮 演示
          </Link>
          <Link 
            to="/rules" 
            className={`nav-link ${isActive('/rules') ? 'active' : ''}`}
          >
            📖 规则
          </Link>
        </nav>

        {/* 用户区域 */}
        <div className="header-user">
          <span className="user-welcome">
            👤 {user?.username}
          </span>
          <button 
            onClick={handleLogout}
            disabled={loading}
            className="logout-btn"
          >
            {loading ? '🔄' : '🚪'} {loading ? '退出中...' : '退出'}
          </button>
        </div>

        {/* 移动端菜单按钮 */}
        <div className="mobile-menu">
          <details className="mobile-dropdown">
            <summary className="mobile-menu-btn">
              ☰
            </summary>
            <div className="mobile-menu-content">
              <Link to="/play" className="mobile-nav-link">🎯 游戏</Link>
              <Link to="/profile" className="mobile-nav-link">📊 统计</Link>
              <Link to="/demo" className="mobile-nav-link">🎮 演示</Link>
              <Link to="/rules" className="mobile-nav-link">📖 规则</Link>
              <hr className="mobile-divider" />
              <div className="mobile-user-info">👤 {user?.username}</div>
              <button 
                onClick={handleLogout}
                disabled={loading}
                className="mobile-logout-btn"
              >
                {loading ? '🔄 退出中...' : '🚪 退出'}
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}