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
        
        // 按日期排序（最新的在前）
        const sortedHistory = response.data.sort((a, b) => 
          new Date(b.startedAt) - new Date(a.startedAt)
        );
        
        // 调试：检查数据结构
        console.log('Game history data:', sortedHistory);
        if (sortedHistory.length > 0) {
          console.log('First game initial cards:', sortedHistory[0].initialCards);
          console.log('First game game cards:', sortedHistory[0].gameCards);
        }
        
        setGameHistory(sortedHistory);
        
        // 计算统计数据
        const totalGames = sortedHistory.length;
        const wins = sortedHistory.filter(game => game.status === 'won').length;
        const losses = totalGames - wins;
        const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0;
        const totalCardsCollected = sortedHistory.reduce((sum, game) => sum + game.stats.totalCards, 0);
        const averageCardsPerGame = totalGames > 0 ? (totalCardsCollected / totalGames).toFixed(1) : 0;
        
        setStats({ 
          totalGames, 
          wins, 
          losses, 
          winRate: parseFloat(winRate),
          totalCardsCollected,
          averageCardsPerGame: parseFloat(averageCardsPerGame)
        });
      } catch (error) {
        console.error('Failed to fetch game history:', error);
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

  const toggleGameDetails = (gameId) => {
    setSelectedGame(selectedGame === gameId ? null : gameId);
  };

  // 渲染卡牌项目
  const renderCardItem = (card, cardType, roundNumber = null) => {
    const isInitialCard = cardType === 'initial';
    const isWonCard = cardType === 'won';
    const isLostCard = cardType === 'lost';

    return (
      <div 
        key={card.id}
        className={`card-item-history ${cardType}`}
      >
        <div className="card-item-left">
          <div className={`card-position ${cardType}`}>
            {isInitialCard ? '🎯' :
             roundNumber ? roundNumber :
             '❌'}
          </div>
          {/* 添加卡牌图片 */}
          <div className="card-image-container">
            {card.imgUrl ? (
              <img 
                src={card.imgUrl} 
                alt={card.title}
                className="card-image-small"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const placeholder = e.target.nextElementSibling;
                  if (placeholder) {
                    placeholder.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="card-image-placeholder" style={{ display: card.imgUrl ? 'none' : 'flex' }}>
              📷
            </div>
          </div>
          <div className="card-details">
            <div className="card-name">{card.title}</div>
            <div className="card-badluck">Bad Luck: {card.badLuckIdx.toFixed(1)}</div>
          </div>
        </div>
        <div className="card-item-right">
          {isInitialCard && (
            <div className="card-status initial">
              初始获得
            </div>
          )}
          {isWonCard && (
            <>
              <div className="card-round">
                第 {roundNumber} 轮
              </div>
              <div className="card-status won">
                ✅ 猜对获得
              </div>
            </>
          )}
          {isLostCard && (
            <>
              <div className="card-round">
                第 {roundNumber} 轮
              </div>
              <div className="card-status lost">
                ❌ 猜错丢弃
              </div>
            </>
          )}
        </div>
      </div>
    );
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
        {/* 用户信息 */}
        <div className="profile-header">
          <h1>👤 个人资料</h1>
          <p className="username">欢迎, {user?.username || '玩家'}!</p>
        </div>

        {/* 统计信息 */}
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

        {/* 游戏历史 */}
        <div className="history-section">
          <h2>🎮 游戏历史记录</h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '1.5rem' }}>
            按日期排序，最新的游戏在前
          </p>
          
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
                  onClick={() => toggleGameDetails(game.id)}
                >
                  {/* 游戏概览 */}
                  <div className="game-info">
                    <div>
                      <div className="game-date">
                        游戏 #{game.id} - {formatDate(game.startedAt)}
                      </div>
                      <div className={`game-status ${game.status}`}>
                        {game.status === 'won' ? '🏆 胜利' : '😔 失败'}
                      </div>
                    </div>
                    <div className="game-summary">
                      <div>游戏时长: {getGameDuration(game.startedAt, game.endedAt)}</div>
                      <div>收集卡牌: {game.stats.totalCards}/6</div>
                      <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>👆 点击查看详情</div>
                    </div>
                  </div>

                  {/* 快速统计 */}
                  <div className="game-quick-stats">
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.initialCards.length}</div>
                      <div className="quick-stat-label">初始手牌</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.wrongCount}/3</div>
                      <div className="quick-stat-label">失误次数</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.stats.totalRounds}</div>
                      <div className="quick-stat-label">游戏轮次</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.stats.wonRounds}</div>
                      <div className="quick-stat-label">成功轮次</div>
                    </div>
                  </div>

                  {/* 详细信息（可展开） */}
                  {selectedGame === game.id && (
                    <div className="game-details-expanded">
                      {/* 所有涉及的卡牌 - 按类型分组 */}
                      <div className="cards-section">
                        <h4>🃏 本局游戏涉及的所有卡牌</h4>
                        
                        {/* 初始卡牌部分 */}
                        <div className="initial-cards-section">
                          <h5 className="section-title initial">
                            🎯 初始手牌
                            <span className="section-badge">游戏开始时自动获得</span>
                          </h5>
                          <div className="cards-list">
                            {game.initialCards.map(card => 
                              renderCardItem(card, 'initial')
                            )}
                          </div>
                        </div>

                        {/* 游戏轮次卡牌部分 */}
                        {game.gameCards.length > 0 && (
                          <div className="game-cards-section">
                            <h5 className="section-title">
                              🎲 游戏轮次卡牌
                              <span className="section-badge">共 {game.gameCards.length} 轮</span>
                            </h5>
                            
                            {/* 获得的卡牌 */}
                            {game.gameCards.filter(card => card.guessedCorrect).length > 0 && (
                              <div className="won-cards-subsection">
                                <h6 className="subsection-title won">✅ 猜对获得的卡牌:</h6>
                                <div className="cards-list">
                                  {game.gameCards
                                    .filter(card => card.guessedCorrect)
                                    .map(card => renderCardItem(card, 'won', card.roundNumber))
                                  }
                                </div>
                              </div>
                            )}

                            {/* 丢弃的卡牌 */}
                            {game.gameCards.filter(card => !card.guessedCorrect).length > 0 && (
                              <div className="lost-cards-subsection">
                                <h6 className="subsection-title lost">❌ 猜错丢弃的卡牌:</h6>
                                <div className="cards-list">
                                  {game.gameCards
                                    .filter(card => !card.guessedCorrect)
                                    .map(card => renderCardItem(card, 'lost', card.roundNumber))
                                  }
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 如果没有游戏轮次 */}
                        {game.gameCards.length === 0 && (
                          <div className="no-rounds-notice">
                            <p>⚠️ 本局游戏没有进行任何轮次，只保留了初始手牌。</p>
                          </div>
                        )}
                      </div>

                      {/* 游戏总结 */}
                      <div className={`game-final-summary ${game.status}`}>
                        <h4>
                          📊 游戏总结
                          {game.status === 'won' ? 
                            <span style={{ marginLeft: '0.5rem', color: '#4caf50' }}>🏆</span> : 
                            <span style={{ marginLeft: '0.5rem', color: '#f44336' }}>💔</span>
                          }
                        </h4>
                        <div className="summary-details">
                          <p>
                            <strong>游戏结果:</strong> 
                            {game.status === 'won' ? 
                              ' 🎉 恭喜胜利！成功收集了所有可能的卡牌。' : 
                              ' 😔 游戏失败，失误次数达到上限。'
                            }
                          </p>
                          <p>
                            <strong>最终收集:</strong> 
                            {' '}{game.stats.totalCards} 张卡牌 
                            (初始获得 {game.initialCards.length} 张 + 游戏中获得 {game.stats.wonRounds} 张)
                          </p>
                          <p>
                            <strong>轮次表现:</strong> 
                            {game.stats.totalRounds > 0 ? 
                              ` ${game.stats.wonRounds}/${game.stats.totalRounds} 轮成功 (${((game.stats.wonRounds / game.stats.totalRounds) * 100).toFixed(1)}%)` : 
                              ' 未进行游戏轮次'
                            }
                          </p>
                          <p>
                            <strong>失误情况:</strong> 
                            {' '}{game.wrongCount}/3 次失误
                            {game.wrongCount === 3 && ' (达到上限，游戏结束)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 操作按钮 */}
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

        {/* 底部说明 */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
            💡 点击游戏记录可以查看每局游戏的详细卡牌信息
          </p>
          <p style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
            历史记录按日期排序，显示所有涉及的卡牌及其获得情况
          </p>
        </div>
      </div>
    </div>
  );
}