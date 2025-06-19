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
        
        // Sort by date (newest first)
        const sortedHistory = response.data.sort((a, b) => 
          new Date(b.startedAt) - new Date(a.startedAt)
        );
        
        // Debugging: check data structure
        console.log('Game history data:', sortedHistory);
        if (sortedHistory.length > 0) {
          console.log('First game initial cards:', sortedHistory[0].initialCards);
          console.log('First game game cards:', sortedHistory[0].gameCards);
        }
        
        setGameHistory(sortedHistory);
        
        // Calculate statistics
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
    return new Date(dateString).toLocaleDateString('en-US', {
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

  // Render card item
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
          {/* Add card image */}
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
              Initially Obtained
            </div>
          )}
          {isWonCard && (
            <>
              <div className="card-round">
                Round {roundNumber}
              </div>
              <div className="card-status won">
                ✅ Guessed Correctly
              </div>
            </>
          )}
          {isLostCard && (
            <>
              <div className="card-round">
                Round {roundNumber}
              </div>
              <div className="card-status lost">
                ❌ Guessed Wrong, Discarded
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
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* User Information */}
        <div className="profile-header">
          <h1>👤 Profile</h1>
          <p className="username">Welcome, {user?.username || 'Player'}!</p>
        </div>

        {/* Statistics Section */}
        <div className="stats-section">
          <h2>📊 Game Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{stats.totalGames}</div>
              <div className="stat-label">Total Games</div>
            </div>
            <div className="stat-card wins">
              <div className="stat-number">{stats.wins}</div>
              <div className="stat-label">Wins</div>
            </div>
            <div className="stat-card losses">
              <div className="stat-number">{stats.losses}</div>
              <div className="stat-label">Losses</div>
            </div>
            <div className="stat-card winrate">
              <div className="stat-number">{stats.winRate}%</div>
              <div className="stat-label">Win Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.totalCardsCollected}</div>
              <div className="stat-label">Cards Collected</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{stats.averageCardsPerGame}</div>
              <div className="stat-label">Avg. Cards per Game</div>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="history-section">
          <h2>🎮 Game History</h2>
          <p style={{ textAlign: 'center', color: '#7f8c8d', marginBottom: '1.5rem' }}>
            Sorted by date, newest games first
          </p>
          
          {gameHistory.length === 0 ? (
            <div className="no-history">
              <p>No game records yet</p>
              <Link to="/play" className="btn-start-playing">
                Start your first game
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
                  {/* Game Overview */}
                  <div className="game-info">
                    <div>
                      <div className="game-date">
                        Game #{game.id} - {formatDate(game.startedAt)}
                      </div>
                      <div className={`game-status ${game.status}`}>
                        {game.status === 'won' ? '🏆 Win' : '😔 Loss'}
                      </div>
                    </div>
                    <div className="game-summary">
                      <div>Duration: {getGameDuration(game.startedAt, game.endedAt)}</div>
                      <div>Cards Collected: {game.stats.totalCards}/6</div>
                      <div style={{ fontSize: '0.8rem', color: '#95a5a6' }}>👆 Click for details</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="game-quick-stats">
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.initialCards.length}</div>
                      <div className="quick-stat-label">Initial Hand</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.wrongCount}/3</div>
                      <div className="quick-stat-label">Mistakes</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.stats.totalRounds}</div>
                      <div className="quick-stat-label">Rounds Played</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-number">{game.stats.wonRounds}</div>
                      <div className="quick-stat-label">Successful Rounds</div>
                    </div>
                  </div>

                  {/* Detailed Information (Expandable) */}
                  {selectedGame === game.id && (
                    <div className="game-details-expanded">
                      {/* All cards involved - grouped by type */}
                      <div className="cards-section">
                        <h4>🃏 All Cards Involved in this Game</h4>
                        
                        {/* Initial Cards Section */}
                        <div className="initial-cards-section">
                          <h5 className="section-title initial">
                            🎯 Initial Hand
                            <span className="section-badge">Automatically obtained at game start</span>
                          </h5>
                          <div className="cards-list">
                            {game.initialCards.map(card => 
                              renderCardItem(card, 'initial')
                            )}
                          </div>
                        </div>

                        {/* Game Round Cards Section */}
                        {game.gameCards.length > 0 && (
                          <div className="game-cards-section">
                            <h5 className="section-title">
                              🎲 Game Round Cards
                              <span className="section-badge">{game.gameCards.length} Rounds total</span>
                            </h5>
                            
                            {/* Cards Won */}
                            {game.gameCards.filter(card => card.guessedCorrect).length > 0 && (
                              <div className="won-cards-subsection">
                                <h6 className="subsection-title won">✅ Cards Won:</h6>
                                <div className="cards-list">
                                  {game.gameCards
                                    .filter(card => card.guessedCorrect)
                                    .map(card => renderCardItem(card, 'won', card.roundNumber))
                                  }
                                </div>
                              </div>
                            )}

                            {/* Cards Lost */}
                            {game.gameCards.filter(card => !card.guessedCorrect).length > 0 && (
                              <div className="lost-cards-subsection">
                                <h6 className="subsection-title lost">❌ Cards Discarded:</h6>
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

                        {/* If no game rounds were played */}
                        {game.gameCards.length === 0 && (
                          <div className="no-rounds-notice">
                            <p>⚠️ No rounds were played in this game. Only initial hand was kept.</p>
                          </div>
                        )}
                      </div>

                      {/* Game Summary */}
                      <div className={`game-final-summary ${game.status}`}>
                        <h4>
                          📊 Game Summary
                          {game.status === 'won' ? 
                            <span style={{ marginLeft: '0.5rem', color: '#4caf50' }}>🏆</span> : 
                            <span style={{ marginLeft: '0.5rem', color: '#f44336' }}>💔</span>
                          }
                        </h4>
                        <div className="summary-details">
                          <p>
                            <strong>Game Result:</strong> 
                            {game.status === 'won' ? 
                              ' 🎉 Congratulations, you won! You successfully collected all possible cards.' : 
                              ' 😔 Game over, maximum mistakes reached.'
                            }
                          </p>
                          <p>
                            <strong>Final Collection:</strong> 
                            {' '}{game.stats.totalCards} cards 
                            (Initially obtained {game.initialCards.length} + Won {game.stats.wonRounds} during game)
                          </p>
                          <p>
                            <strong>Round Performance:</strong> 
                            {game.stats.totalRounds > 0 ? 
                              ` ${game.stats.wonRounds}/${game.stats.totalRounds} rounds successful (${((game.stats.wonRounds / game.stats.totalRounds) * 100).toFixed(1)}%)` : 
                              ' No game rounds played'
                            }
                          </p>
                          <p>
                            <strong>Mistakes:</strong> 
                            {' '}{game.wrongCount}/3 mistakes
                            {game.wrongCount === 3 && ' (Maximum reached, game over)'}
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

        {/* Action Buttons */}
        <div className="profile-actions">
          <Link to="/play" className="btn-play">
            🎮 Continue Playing
          </Link>
          <Link to="/demo" className="btn-demo">
            🎯 Practice Mode
          </Link>
          <Link to="/rules" className="btn-rules">
            📖 Game Rules
          </Link>
        </div>

        {/* Footer Note */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginBottom: '0.5rem' }}>
            💡 Click on a game record to view detailed card information for that game
          </p>
          <p style={{ fontSize: '0.8rem', color: '#95a5a6' }}>
            History records are sorted by date, showing all involved cards and their acquisition status
          </p>
        </div>
      </div>
    </div>
  );
}