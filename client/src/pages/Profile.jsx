import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [stats, setStats] = useState({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    totalCardsCollected: 0,
    averageCardsPerGame: 0
  });

  useEffect(() => {
    async function fetchGameHistory() {
      try {
        const response = await axios.get('/api/games/history', { withCredentials: true });
        setGameHistory(response.data);
        
        // 计算统计数据
        const totalGames = response.data.length;
        const wins = response.data.filter(game => game.status === 'won').length;
        const losses = totalGames - wins;
        const winRate = totalGames > 0 ? (wins / totalGames * 100).toFixed(1) : 0;
        const totalCardsCollected = response.data.reduce((sum, game) => sum + game.stats.totalCards, 0);
        const averageCardsPerGame = totalGames > 0 ? (totalCardsCollected / totalGames).toFixed(1) : 0;
        
        setStats({ 
          totalGames, 
          wins, 
          losses, 
          winRate,
          totalCardsCollected,
          averageCardsPerGame
        });
      } catch (error) {
        console.error('Failed to fetch game history:', error);
        // 使用空数组作为默认值
        setGameHistory([]);
        setStats({ totalGames: 0, wins: 0, losses: 0, winRate: 0, totalCardsCollected: 0, averageCardsPerGame: 0 });
      } finally {
        setLoading(false);
      }
    }

    fetchGameHistory();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameDuration = (startedAt, endedAt) => {
    if (!endedAt) return '--';
    const start = new Date(startedAt);
    const end = new Date(endedAt);
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

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
            <div className="stat-card">
              <div className="stat-number">{stats.totalCardsCollected}</div>
              <div className="stat-label">收集卡牌</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageCardsPerGame}</div>
              <div className="stat-label">平均每局</div>
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
                <div 
                  key={game.id} 
                  className={`history-item ${game.status}`}
                  onClick={() => setSelectedGame(selectedGame === game.id ? null : game.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="game-info">
                    <div className="game-header">
                      <div className="game-date">游戏 #{game.id} - {formatDate(game.startedAt)}</div>
                      <div className={`game-status ${game.status}`}>
                        {game.status === 'won' ? '🏆 胜利' : '😔 失败'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="game-summary">
                    <div className="summary-stats">
                      <span className="stat-item">收集卡牌: {game.stats.totalCards}/6</span>
                      <span className="stat-item">失误次数: {game.wrongCount}/3</span>
                      <span className="stat-item">游戏时长: {getGameDuration(game.startedAt, game.endedAt)}</span>
                      <span className="stat-item">轮次: {game.stats.totalRounds} ({game.stats.wonRounds}胜/{game.stats.lostRounds}负)</span>
                    </div>
                  </div>

                  {selectedGame === game.id && (
                    <div className="game-details-expanded">
                      <div className="cards-section">
                        <h4>🎯 初始手牌 (游戏开始时获得)</h4>
                        <div className="cards-list">
                          {game.initialCards.map((card, idx) => (
                            <div key={`initial-${card.id}`} className="card-item-history initial">
                              <span className="card-position">{idx + 1}</span>
                              <span className="card-name">{card.title}</span>
                              <span className="card-badluck">Bad Luck: {card.badLuckIdx}</span>
                              <span className="card-status">✅ 初始获得</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {game.gameCards.length > 0 && (
                        <div className="cards-section">
                          <h4>🎲 游戏轮次</h4>
                          <div className="cards-list">
                            {game.gameCards.map((card) => (
                              <div key={`round-${card.id}`} className={`card-item-history ${card.guessedCorrect ? 'won' : 'lost'}`}>
                                <span className="card-position">第{card.orderNo + 1}轮</span>
                                <span className="card-name">{card.title}</span>
                                <span className="card-badluck">Bad Luck: {card.badLuckIdx}</span>
                                <span className="card-status">
                                  {card.guessedCorrect ? '✅ 猜对获得' : '❌ 猜错丢弃'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="game-final-summary">
                        <p>
                          <strong>游戏结果:</strong> 
                          {game.status === 'won' ? 
                            ' 🎉 恭喜胜利！成功收集了所有可能的卡牌。' : 
                            ' 😔 游戏失败，失误次数达到上限。'
                          }
                        </p>
                        <p>
                          <strong>最终收集:</strong> {game.stats.totalCards} 张卡牌
                          （初始 {game.initialCards.length} 张 + 游戏中获得 {game.stats.wonRounds} 张）
                        </p>
                      </div>
                    </div>
                  )}
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