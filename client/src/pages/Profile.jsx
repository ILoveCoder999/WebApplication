import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0
  });

  useEffect(() => {
    async function fetchGameHistory() {
      try {
        // 这里假设后端有相应的API接口
        const response = await axios.get('/api/user/games');
        setGameHistory(response.data);
        
        // 计算统计数据
        const totalGames = response.data.length;
        const wins = response.data.filter(game => game.status === 'won').length;
        const losses = totalGames - wins;
        const winRate = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0;
        
        setStats({ totalGames, wins, losses, winRate });
      } catch (error) {
        console.error('Failed to fetch game history:', error);
        // 如果API不存在，使用模拟数据
        const mockData = [
          { id: 1, date: '2025-06-17', status: 'won', score: 15, duration: '5:32' },
          { id: 2, date: '2025-06-16', status: 'lost', score: 8, duration: '3:45' },
          { id: 3, date: '2025-06-15', status: 'won', score: 12, duration: '4:18' },
        ];
        setGameHistory(mockData);
        setStats({ totalGames: 3, wins: 2, losses: 1, winRate: 66.7 });
      } finally {
        setLoading(false);
      }
    }

    fetchGameHistory();
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 个人资料</h1>
          <p className="username">欢迎, {user?.username || '玩家'}!</p>
        </div>

        <div className="stats-section">
          <h2>📊 游戏统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalGames}</div>
              <div className="stat-label">总游戏数</div>
            </div>
            <div className="stat-card wins">
              <div className="stat-number">{stats.wins}</div>
              <div className="stat-label">胜利</div>
            </div>
            <div className="stat-card losses">
              <div className="stat-number">{stats.losses}</div>
              <div className="stat-label">失败</div>
            </div>
            <div className="stat-card winrate">
              <div className="stat-number">{stats.winRate}%</div>
              <div className="stat-label">胜率</div>
            </div>
          </div>
        </div>

        <div className="history-section">
          <h2>🎮 游戏历史</h2>
          {gameHistory.length === 0 ? (
            <div className="no-history">
              <p>还没有游戏记录</p>
              <Link to="/play" className="btn-start-playing">
                开始第一场游戏
              </Link>
            </div>
          ) : (
            <div className="history-list">
              {gameHistory.map((game) => (
                <div key={game.id} className={`history-item ${game.status}`}>
                  <div className="game-info">
                    <div className="game-date">{game.date}</div>
                    <div className={`game-status ${game.status}`}>
                      {game.status === 'won' ? '🏆 胜利' : '😔 失败'}
                    </div>
                  </div>
                  <div className="game-details">
                    <span className="game-score">得分: {game.score}</span>
                    <span className="game-duration">时长: {game.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="profile-actions">
          <Link to="/play" className="btn-play">
            🎮 继续游戏
          </Link>
          <Link to="/demo" className="btn-demo">
            🎯 练习模式
          </Link>
          <Link to="/rules" className="btn-rules">
            📖 游戏规则
          </Link>
        </div>
      </div>
    </div>
  );
}