// File: client/src/pages/Play.jsx

import React, { useEffect, useState } from 'react';
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

  // 初始化游戏
  useEffect(() => {
    async function startGame() {
      try {
        setLoading(true);
        setError('');
        
        // 创建新游戏
        const res = await axios.post('/api/games');
        const { gameId, hand: initialHand } = res.data;
        setGameId(gameId);
        setHand(initialHand);

        // 获取第一张待猜卡
        const nextRes = await axios.get(`/api/games/${gameId}/next`);
        setHiddenCard(nextRes.data);

        setRoundIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to start game:', err);
        setError('游戏启动失败，请刷新页面重试');
        setLoading(false);
      }
    }
    
    startGame();
  }, []);

  // 处理猜测
  const handleGuess = async (position) => {
    if (!hiddenCard || gameId === null || isGameOver || loading) return;

    try {
      const res = await axios.post(`/api/games/${gameId}/guess`, {
        position,
        cardId: hiddenCard.id,
      });
      
      const {
        correct,
        wrongCount: newWrongCount,
        isGameOver: over,
        finalStatus: status,
      } = res.data;

      setWrongCount(newWrongCount);
      setIsGameOver(over);
      setFinalStatus(status);

      if (correct) {
        // 猜对了
        setWrongGuess(false);
        
        // 更新手牌
        const newHand = [...hand];
        newHand.splice(position, 0, hiddenCard);
        setHand(newHand);

        if (!over) {
          // 获取下一张卡
          const nextRes = await axios.get(`/api/games/${gameId}/next`);
          setHiddenCard(nextRes.data);
          setRoundIndex(prev => prev + 1);
        } else {
          // 游戏胜利
          setHiddenCard(null);
        }
      } else {
        // 猜错了
        setWrongGuess(true);
        setTimeout(() => setWrongGuess(false), 500);

        if (!over) {
          // 继续同一张卡
          setRoundIndex(prev => prev + 1);
        } else {
          // 游戏失败
          setHiddenCard(null);
        }
      }
    } catch (err) {
      console.error('Error during guess:', err);
      setError('提交失败，请重试');
    }
  };

  // 超时处理
  const handleTimeUp = () => {
    if (!hiddenCard || gameId === null || isGameOver) return;
    handleGuess(-1); // -1 表示超时
  };

  // 重新开始游戏
  const handleRestart = () => {
    window.location.reload();
  };

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
          <div className="loading-spinner"></div>
          <p>正在启动游戏...</p>
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
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>出错了</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={handleRestart}
            style={{
              background: '#3498db',
              color: 'white',
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            重新开始
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
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          margin: '2rem auto',
          maxWidth: '500px'
        }}>
          {finalStatus === 'won' ? (
            <>
              <h2 className="result-message" style={{ color: '#27ae60' }}>
                🎉 恭喜胜利！🎉
              </h2>
              <p style={{ marginBottom: '2rem' }}>
                您成功排列了所有卡片！<br/>
                失误次数：{wrongCount}/3
              </p>
            </>
          ) : (
            <>
              <h2 className="result-message" style={{ color: '#e74c3c' }}>
                😔 游戏结束 😔
              </h2>
              <p style={{ marginBottom: '2rem' }}>
                您已经失误了 3 次<br/>
                不要灰心，再试一次！
              </p>
            </>
          )}
          
          <button
            className="btn-restart"
            onClick={handleRestart}
            style={{
              background: 'linear-gradient(45deg, #3498db, #2980b9)',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🔄 再玩一次
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="play-page">
      <h2 className="play-header">🎮 Stuff Happens - 游戏进行中</h2>
      <p className="status-text">失误次数: {wrongCount} / 3</p>

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
          borderRadius: '10px'
        }}>
          <p style={{ color: 'white', margin: 0 }}>
            💡 提示：将 "{hiddenCard.title}" 拖拽到正确位置
          </p>
        </div>
      )}
    </div>
  );
}