import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameBoard from '../components/GameBoard.jsx';
import TimerBar from '../components/TimerBar.jsx';
import './DemoPage.css';

// Import image assets
import missedFlightImg from '../assets/images/1missed-flight.png';
import lostLuggageImg from '../assets/images/2lost-luggage.png';  
import passportIssueImg from '../assets/images/3passport-issue.png';
import hotelFullImg from '../assets/images/4hotel-full.png';

// Simulated demo data - travel-related unfortunate events
const DEMO_INITIAL_HAND = [
  { id: 'demo1', title: 'Missed Flight', imgUrl: missedFlightImg, badLuckIdx: 15.2 },
  { id: 'demo2', title: 'Lost Luggage', imgUrl: lostLuggageImg, badLuckIdx: 25.8 },
  { id: 'demo3', title: 'Passport Issue', imgUrl: passportIssueImg, badLuckIdx: 45.6 }
];

const DEMO_HIDDEN_CARD = {
  id: 'demo4', 
  title: 'Hotel Fully Booked', 
  imgUrl: hotelFullImg, 
  badLuckIdx: 32.4
};

export default function DemoPage() {
  const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'correct', 'wrong', 'timeout'
  const [hand, setHand] = useState(DEMO_INITIAL_HAND);
  const [hiddenCard, setHiddenCard] = useState(DEMO_HIDDEN_CARD);
  const [wrongGuess, setWrongGuess] = useState(false);
  const [userGuess, setUserGuess] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [finalHand, setFinalHand] = useState([]); // Store final hand

  const handleStartGame = () => {
    setGameState('playing');
    setTimerKey(prev => prev + 1); // Reset timer
  };

  const handleGuess = (position) => {
    if (gameState !== 'playing') return;

    setUserGuess(position);
    const correctPosition = 2;

    if (position === correctPosition) {
      setGameState('correct');
      setWrongGuess(false);

      const newHand = [...hand];
      newHand.splice(position, 0, hiddenCard);
      setHand(newHand);
      setFinalHand(newHand);
      setHiddenCard(null);
    } else {
      setGameState('wrong');
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);
      setFinalHand([...hand]);
    }
  };

  const handleTimeUp = () => {
    if (gameState === 'playing') {
      setGameState('timeout');
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);
      setFinalHand([...hand]);
    }
  };

  const resetDemo = () => {
    setGameState('intro');
    setHand(DEMO_INITIAL_HAND);
    setHiddenCard(DEMO_HIDDEN_CARD);
    setWrongGuess(false);
    setUserGuess(null);
    setFinalHand([]);
  };

  const handlePlayAgain = () => {
    setGameState('playing');
    setHand(DEMO_INITIAL_HAND);
    setHiddenCard(DEMO_HIDDEN_CARD);
    setWrongGuess(false);
    setUserGuess(null);
    setFinalHand([]);
    setTimerKey(prev => prev + 1);
  };

  const renderCardDisplay = (card, index) => (
    <div key={`${card.id}-${index}`} className="demo-final-card-item">
      <div className="demo-final-card-position">{index + 1}</div>
      <div className="demo-final-card-content">
        <img 
          src={card.imgUrl} 
          alt={card.title}
          className="demo-final-card-image"
          onError={(e) => {
            e.target.style.display = 'none';
            const parent = e.target.parentNode;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #e3f2fd, #bbdefb)';
              parent.style.display = 'flex';
              parent.style.alignItems = 'center';
              parent.style.justifyContent = 'center';
              parent.innerHTML = '<span style="color: #1976d2; font-weight: bold;">Image Load Failed</span>';
            }
          }}
        />
        <div className="demo-final-card-info">
          <div className="demo-final-card-title">{card.title}</div>
          <div className="demo-final-card-index">Bad Luck: {card.badLuckIdx.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );

  if (gameState === 'intro') {
    return (
      <div className="demo-page">
        <div className="demo-intro">
          <h1 className="demo-title">🎮 Stuff Happens - Demo Version</h1>
          <div className="demo-explanation">
            <h2>How It Works</h2>
            <p>This is a single-round demo to help you understand the gameplay:</p>
            <ul className="demo-rules">
              <li>You will see 3 sorted cards showing their bad luck index</li>
              <li>You must drag the new card into the correct position</li>
              <li>Remember: lower index = less unlucky = closer to front</li>
              <li>You have 30 seconds to decide</li>
              <li><strong>Important:</strong> Incorrect or late decisions will discard the card permanently</li>
            </ul>
            <div className="current-hand-preview">
              <h3>Your Current Cards:</h3>
              <div className="hand-preview">
                {DEMO_INITIAL_HAND.map((card, idx) => (
                  <div key={card.id} className="preview-card">
                    <span className="preview-position">{idx + 1}</span>
                    <span className="preview-title">{card.title}</span>
                    <span className="preview-index">{card.badLuckIdx}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="challenge-card">
              <h3>Challenge Card:</h3>
              <div className="preview-card challenge">
                <span className="preview-title">{DEMO_HIDDEN_CARD.title}</span>
                <span className="preview-question">Bad Luck Index: ???</span>
              </div>
              <p className="challenge-hint">
                Where should "{DEMO_HIDDEN_CARD.title}" be inserted?
              </p>
              <p style={{ color: '#ffeb3b', fontWeight: 'bold', marginTop: '1rem' }}>
                ⚠️ WARNING: Wrong guess or timeout will discard this card forever!
              </p>
            </div>
          </div>
          <button onClick={handleStartGame} className="btn-start-demo">
            Start Demo Game 🚀
          </button>
          <div className="demo-footer">
            <Link to="/rules" className="link-rules">📖 View Full Rules</Link>
            <Link to="/" className="link-login">🔑 Log in to Play Full Version</Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'correct') {
    return (
      <div className="demo-page">
        <div className="demo-result success">
          <h2>🎉 Well Done!</h2>
          <p>The bad luck index of "{DEMO_HIDDEN_CARD.title}" is <strong>{DEMO_HIDDEN_CARD.badLuckIdx}</strong></p>
          <p>You correctly placed it at position {userGuess + 1}!</p>
          <p style={{ color: '#e8f5e8', fontWeight: 'bold' }}>✅ The card has been added to your hand</p>
          {finalHand.length > 0 && (
            <div className="demo-final-cards-grid-container">
              <h3>🎴 Your Final Cards:</h3>
              <div className="demo-final-cards-grid">
                {finalHand.map((card, index) => renderCardDisplay(card, index))}
              </div>
              <p className="demo-note">Cards are sorted by Bad Luck index</p>
            </div>
          )}
          <div className="demo-summary">
            <h3>🎮 Demo Complete!</h3>
            <p>You collected {finalHand.length} cards. Ready to try the full game?</p>
          </div>
          <div className="demo-complete-actions">
            <button onClick={handlePlayAgain} className="btn-retry">
              🔄 Try the Demo Again
            </button>
            <Link to="/rules" className="btn-rules">
              📖 View Full Rules
            </Link>
            <Link to="/" className="btn-register">
              🎮 Play Full Game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'wrong' || gameState === 'timeout') {
    return (
      <div className="demo-page">
        <div className="demo-result failure">
          <h2>😅 {gameState === 'timeout' ? 'Time’s Up!' : 'Incorrect Guess!'}</h2>
          <p>The correct bad luck index of "{DEMO_HIDDEN_CARD.title}" is <strong>{DEMO_HIDDEN_CARD.badLuckIdx}</strong></p>
          <p style={{ color: '#ffcdd2', fontWeight: 'bold' }}>
            ❌ The card has been permanently discarded
          </p>
          <p>Correct position: slot 3 (between 25.8 and 45.6)</p>
          {finalHand.length > 0 && (
            <div className="demo-final-cards-grid-container">
              <h3>🎴 Cards You Still Have:</h3>
              <div className="demo-final-cards-grid">
                {finalHand.map((card, index) => renderCardDisplay(card, index))}
              </div>
              <p className="demo-note">
                Only the initial {finalHand.length} cards are retained. New card was discarded.
              </p>
            </div>
          )}
          <div className="explanation">
            <h3>Explanation:</h3>
            <p>Cards should be sorted in ascending order of bad luck index:</p>
            <div className="correct-order">
              <div className="order-item">Missed Flight (15.2)</div>
              <div className="order-item">Lost Luggage (25.8)</div>
              <div className="order-item highlight">→ Hotel Fully Booked (32.4) ←</div>
              <div className="order-item">Passport Issue (45.6)</div>
            </div>
            <p className="demo-note">
              💡 In the full game, a wrong guess or timeout means you lose the card permanently.
            </p>
          </div>
          <div className="demo-summary">
            <h3>🎮 Demo Complete!</h3>
            <p>Even though you didn’t get the new card, you’ve learned the basics. Ready for the full game?</p>
          </div>
          <div className="demo-complete-actions">
            <button onClick={handlePlayAgain} className="btn-retry">
              🔄 Try the Demo Again
            </button>
            <Link to="/rules" className="btn-rules">
              📖 Learn the Full Rules
            </Link>
            <Link to="/" className="btn-register">
              🎮 Start Full Game
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Game in progress
  return (
    <div className="demo-page">
      <div className="demo-game-header">
        <h2>🎮 Demo Game In Progress</h2>
        <p>Drag "{hiddenCard.title}" into the correct position</p>
      </div>

      <TimerBar
        duration={30}
        onTimeUp={handleTimeUp}
        resetSignal={timerKey}
      />

      <GameBoard
        hand={hand}
        hiddenCard={hiddenCard}
        wrongGuess={wrongGuess}
        onDrop={handleGuess}
      />

      <div className="demo-hints">
        <p>💡 Tip: Look at the bad luck index of the existing cards and decide where the new one fits</p>
        <p style={{ color: '#d32f2f', fontWeight: 'bold', marginTop: '0.5rem' }}>
          ⚠️ WARNING: Wrong guess or timeout will discard this card permanently!
        </p>
      </div>
    </div>
  );
}
