// File: client/src/pages/Play.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GameBoard from '../components/GameBoard.jsx';
import TimerBar from '../components/TimerBar.jsx';
import './Play.css';

export default function Play() {
  const [gameId, setGameId] = useState(null);
  const [hand, setHand] = useState([]);
  const [hiddenCard, setHiddenCard] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStatus, setFinalStatus] = useState('');
  const [wrongGuess, setWrongGuess] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalHand, setFinalHand] = useState([]); // Save final hand

  // Prevent multiple initializations
  const initialized = useRef(false);
  const currentGameId = useRef(null);

  // Initialize game
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function startGame() {
      try {
        setLoading(true);
        setError('');

        console.log('🎮 Starting new game...');

        const res = await axios.post('/api/games', {}, { withCredentials: true });
        const { gameId, hand: initialHand } = res.data;
        if (!gameId) throw new Error('No gameId returned from create game API');
        console.log(`🎯 Game created: ${gameId}`);
        console.log('🃏 Initial hand:', initialHand);

        setGameId(gameId);
        currentGameId.current = gameId;
        setHand(initialHand);

        const nextRes = await axios.get(`/api/games/${gameId}/next`, { withCredentials: true });
        console.log('🎴 Next card:', nextRes.data);

        setHiddenCard(nextRes.data);
        setRoundIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to start game:', err);
        if (err.response?.status === 401) {
          setError('Please log in first');
        } else {
          setError('Failed to start game, please refresh and try again');
        }
        setLoading(false);
      }
    }

    startGame();
  }, []);


  // Handle guess
  const handleGuess = async (position) => {
    if (!hiddenCard || !currentGameId.current || isGameOver || loading) {
      console.log('❌ Cannot guess:', { hiddenCard: !!hiddenCard, gameId: currentGameId.current, isGameOver, loading });
      return;
    }

    try {
      console.log(`🎯 Making guess: position=${position}, cardId=${hiddenCard.id}`);
      
      const res = await axios.post(`/api/games/${currentGameId.current}/guess`, {
        position,
        cardId: hiddenCard.id,
      });
      
      const {
        correct,
        wrongCount: newWrongCount,
        isGameOver: over,
        finalStatus: status,
      } = res.data;

      console.log(`📊 Guess result:`, { correct, newWrongCount, over, status });

      setWrongCount(newWrongCount);
      setIsGameOver(over);
      setFinalStatus(status);

      if (correct) {
        // Correct guess - get card and add to hand
        setWrongGuess(false);
        
        // Update hand
        const newHand = [...hand];
        newHand.splice(position, 0, hiddenCard);
        setHand(newHand);
        
        console.log('✅ Correct! Card added to hand:', newHand);

        if (!over) {
          try {
            // Get next card
            const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
            console.log('🎴 Next card:', nextRes.data);
            setHiddenCard(nextRes.data);
            setRoundIndex(prev => prev + 1);
          } catch (nextErr) {
            console.error('Failed to get next card:', nextErr);
            setError('Failed to get next card');
          }
        } else {
          // Game won - save final hand
          console.log('🎉 Game won!');
          setFinalHand(newHand);
          setHiddenCard(null);
        }
      } else {
        // Wrong guess - card is discarded, not added to hand
        console.log('❌ Wrong guess! Card discarded.');
        setWrongGuess(true);
        setTimeout(() => setWrongGuess(false), 500);

        if (!over) {
          // After wrong guess, immediately get a new card, current card is discarded
          try {
            const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
            console.log('🎴 Next card after wrong guess (previous discarded):', nextRes.data);
            setHiddenCard(nextRes.data);
            setRoundIndex(prev => prev + 1);
          } catch (nextErr) {
            console.error('Failed to get next card after wrong guess:', nextErr);
            setError('Failed to get next card');
          }
        } else {
          // Game lost - save current hand
          console.log('💀 Game lost!');
          setFinalHand([...hand]); // Save hand at the time of loss
          setHiddenCard(null);
        }
      }
    } catch (err) {
      console.error('Error during guess:', err);
      setError('Submission failed, please try again');
    }
  };

  // Timeout handling - card is discarded
  const handleTimeUp = async () => {
    console.log('⏰ Time up! Card will be discarded.');
    if (!hiddenCard || !currentGameId.current || isGameOver) return;
    
    try {
      // Timeout handling: card is discarded, not added to hand, wrong count increases
      let res;
      try {
        res = await axios.post(`/api/games/${currentGameId.current}/timeout`, {
          cardId: hiddenCard.id,
        });
      } catch (timeoutErr) {
        // If no dedicated timeout API, use wrong position -1 to indicate timeout
        console.log('⏰ Using fallback timeout handling');
        res = await axios.post(`/api/games/${currentGameId.current}/guess`, {
          position: -1, // -1 indicates timeout
          cardId: hiddenCard.id,
        });
      }
      
      const {
        wrongCount: newWrongCount,
        isGameOver: over,
        finalStatus: status,
      } = res.data;

      console.log(`⏰ Timeout result: Card discarded, wrong count: ${newWrongCount}`);

      setWrongCount(newWrongCount);
      setIsGameOver(over);
      setFinalStatus(status);

      // Show wrong guess animation
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);

      if (!over) {
        try {
          // After timeout, get a new card, current card is permanently discarded
          const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
          console.log('🎴 Next card after timeout (previous discarded permanently):', nextRes.data);
          setHiddenCard(nextRes.data);
          setRoundIndex(prev => prev + 1);
        } catch (nextErr) {
          console.error('Failed to get next card after timeout:', nextErr);
          setError('Failed to get next card');
        }
      } else {
        // Game lost - save current hand
        console.log('💀 Game lost due to timeout!');
        setFinalHand([...hand]); // Save hand at the time of timeout loss
        setHiddenCard(null);
      }
    } catch (err) {
      console.error('Error during timeout:', err);
      setError('Timeout handling failed');
    }
  };

  // Restart game
  const handleStartNewGame = async () => {
    console.log('🔄 Starting new game...');
    
    try {
      setLoading(true);
      setError('');
      
      // Reset all states
      setGameId(null);
      setHand([]);
      setHiddenCard(null);
      setWrongCount(0);
      setIsGameOver(false);
      setFinalStatus('');
      setWrongGuess(false);
      setRoundIndex(0);
      setFinalHand([]); // Reset final hand
      
      // Create new game
      const res = await axios.post('/api/games', {}, { withCredentials: true });
      const { gameId, hand: initialHand } = res.data;
      if (!gameId) {
        throw new Error('No gameId returned from create game API');
      }
      console.log(`🎯 New game created: ${gameId}`);
      console.log('🃏 Initial hand:', initialHand);
      
      setGameId(gameId);
      currentGameId.current = gameId;
      setHand(initialHand);

      // Get first card to guess
      const nextRes = await axios.get(`/api/games/${gameId}/next`, { withCredentials: true });
      console.log('🎴 First card:', nextRes.data);
      
      setHiddenCard(nextRes.data);
      setRoundIndex(0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to start new game:', err);
      if (err.response?.status === 401) {
        setError('Please log in first');
      } else {
        setError('Failed to start new game, please try again');
      }
      setLoading(false);
    }
  };

  // Render card display component
  const renderCardDisplay = (card, index) => (
    <div key={`${card.id}-${index}`} className="final-card-item">
      <div className="final-card-position">{index + 1}</div>
      <div className="final-card-content">
        <img 
          src={card.imgUrl} 
          alt={card.title}
          className="final-card-image"
          onError={(e) => {
            e.target.style.display = 'none';
            const parent = e.target.parentNode;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
              parent.style.display = 'flex';
              parent.style.alignItems = 'center';
              parent.style.justifyContent = 'center';
              parent.innerHTML = '<span style="color: #1976d2; font-weight: bold;">Image failed to load</span>';
            }
          }}
        />
        <div className="final-card-info">
          <div className="final-card-title">{card.title}</div>
          <div className="final-card-index">Bad Luck: {card.badLuckIdx.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="play-page">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ffffff40',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>Starting game...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="play-page">
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '10px',
          margin: '2rem auto',
          maxWidth: '400px'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>⚠️ An error occurred</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={handleStartNewGame}
            style={{
              background: '#3498db',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            🔄 Restart
          </button>
        </div>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <div className="play-page">
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '20px',
          margin: '2rem auto',
          maxWidth: '800px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {finalStatus === 'won' ? (
            <>
              <h2 style={{ color: '#27ae60', fontSize: '2.5rem', marginBottom: '1rem' }}>
                🎉 Congratulations, you won! 🎉
              </h2>
              <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                You successfully completed this round!
              </p>
            </>
          ) : (
            <>
              <h2 style={{ color: '#e74c3c', fontSize: '2.5rem', marginBottom: '1rem' }}>
                😔 Game Over 😔
              </h2>
              <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                This round has ended
              </p>
            </>
          )}

          {/* Game Statistics */}
          <div style={{
            background: finalStatus === 'won' ? 
              'linear-gradient(135deg, #4caf50, #8bc34a)' : 
              'linear-gradient(135deg, #ff9800, #ff5722)',
            color: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            margin: '2rem 0',
            boxShadow: finalStatus === 'won' ? 
              '0 4px 15px rgba(76, 175, 80, 0.3)' : 
              '0 4px 15px rgba(255, 152, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>
              {finalStatus === 'won' ? '🏆 Game Statistics' : '📊 Game Statistics'}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{finalHand.length}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cards Obtained</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{wrongCount}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Mistakes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>#{gameId}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Game ID</div>
              </div>
            </div>
          </div>

          {/* Display obtained cards */}
          {finalHand.length > 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '2rem',
              borderRadius: '15px',
              margin: '2rem 0',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
                🎴 Your Obtained Cards
              </h3>
              <div className="final-cards-grid">
                {finalHand.map((card, index) => renderCardDisplay(card, index))}
              </div>
              <p style={{ 
                marginTop: '1.5rem', 
                color: '#7f8c8d', 
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                Cards are sorted by Bad Luck Index from low to high
              </p>
            </div>
          )}

          {finalHand.length === 0 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.8)',
              padding: '2rem',
              borderRadius: '15px',
              margin: '2rem 0',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ color: '#e74c3c', marginBottom: '1rem' }}>😔 No Cards Obtained</h3>
              <p style={{ color: '#7f8c8d' }}>
                Unfortunately, no cards were collected in this game. Don't be discouraged, keep challenging!
              </p>
            </div>
          )}

          <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#7f8c8d' }}>
            {finalStatus === 'won' ? 
              'You have successfully collected all possible cards! Ready for a new round?' :
              'Don\'t be discouraged! Every game is an opportunity to learn. Ready to start a new challenge?'
            }
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginTop: '2rem'
          }}>
            <button
              onClick={handleStartNewGame}
              disabled={loading}
              style={{
                background: loading ? '#bdc3c7' : 'linear-gradient(45deg, #3498db, #2980b9)',
                color: 'white',
                padding: '1rem 2rem',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(52, 152, 219, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔄 Starting...' : '🎮 Start New Game'}
            </button>
            
            <Link
              to="/profile"
              style={{
                background: 'linear-gradient(45deg, #9b59b6, #8e44ad)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              📊 View Stats
            </Link>
            
            <Link
              to="/demo"
              style={{
                background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Practice Mode
            </Link>
          </div>
          
          <p style={{ 
            marginTop: '2rem', 
            fontSize: '0.9rem', 
            color: '#95a5a6',
            fontStyle: 'italic'
          }}>
            💡 Tip: Each round has different card combinations. Keep challenging to improve your skills!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="play-page">
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          🎮 Stuff Happens
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem',
          fontSize: '1.1rem'
        }}>
          <span>Game #{gameId}</span>
          <span>Mistakes: {wrongCount}/3</span>
          <span>Hand: {hand.length}/6</span>
        </div>
      </div>

      <TimerBar
        duration={30}
        onTimeUp={handleTimeUp}
        resetSignal={roundIndex}
      />

      <GameBoard
        hand={hand}
        hiddenCard={hiddenCard}
        wrongGuess={wrongGuess}
        onDrop={(position) => handleGuess(position)}
      />
      
      {hiddenCard && (
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          padding: '1rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ color: 'white', margin: 0, fontSize: '1rem' }}>
            💡 <strong>Hint</strong>: Drag "<strong>{hiddenCard.title}</strong>" to the correct position
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            Remember: lower Bad Luck Index comes first!
          </p>
        </div>
      )}
    </div>
  );
}

// Add CSS for spin animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* Final card display styles */
  .final-cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .final-card-item {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    transition: transform 0.3s ease;
    position: relative;
  }
  
  .final-card-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  .final-card-position {
    position: absolute;
    top: 8px;
    left: 8px;
    background: linear-gradient(45deg, #3498db, #2980b9);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.8rem;
    z-index: 1;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .final-card-content {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .final-card-image {
    width: 100%;
    height: 120px;
    object-fit: cover;
    flex-shrink: 0;
  }
  
  .final-card-info {
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .final-card-title {
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    line-height: 1.3;
    font-size: 0.9rem;
  }
  
  .final-card-index {
    color: #7f8c8d;
    font-size: 0.8rem;
    font-weight: 500;
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .final-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }
    
    .final-card-image {
      height: 100px;
    }
    
    .final-card-info {
      padding: 0.75rem;
    }
    
    .final-card-title {
      font-size: 0.8rem;
    }
    
    .final-card-index {
      font-size: 0.7rem;
    }
  }
  
  @media (max-width: 480px) {
    .final-cards-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 0.5rem;
    }
    
    .final-card-image {
      height: 80px;
    }
    
    .final-card-info {
      padding: 0.5rem;
    }
    
    .final-card-title {
      font-size: 0.7rem;
    }
    
    .final-card-index {
      font-size: 0.65rem;
    }
    
    .final-card-position {
      width: 20px;
      height: 20px;
      font-size: 0.7rem;
    }
  }
`;
document.head.appendChild(style);