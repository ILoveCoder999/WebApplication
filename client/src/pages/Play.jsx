// File: client/src/pages/Play.jsx

import React, { useEffect, useState, useRef } from 'react';
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
  
  // 防止重复初始化
  const initialized = useRef(false);
  const currentGameId = useRef(null);

  // 初始化游戏
  useEffect(() => {
    // 防止重复初始化
    if (initialized.current) return;
    initialized.current = true;

    async function startGame() {
      try {
        setLoading(true);
        setError('');
        
        console.log('🎮 Starting new game...');
        
        // 创建新游戏
        const res = await axios.post('/api/games', {}, { withCredentials: true });
        const { gameId, hand: initialHand } = res.data;
        if (!gameId) {
          throw new Error('No gameId returned from create game API');
        }
        console.log(`🎯 Game created: ${gameId}`);
        console.log('🃏 Initial hand:', initialHand);
        
        setGameId(gameId);
        currentGameId.current = gameId;
        setHand(initialHand);

        // 获取第一张待猜卡
        const nextRes = await axios.get(`/api/games/${gameId}/next`, { withCredentials: true });

        console.log('🎴 Next card:', nextRes.data);
        
        setHiddenCard(nextRes.data);
        setRoundIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to start game:', err);
        if (err.response?.status === 401) {
          setError('请先登录');
        } else {
          setError('游戏启动失败，请刷新页面重试');
        }
        setLoading(false);
      }
    }
    
    startGame();
  }, []); // 空依赖数组，只运行一次

  // 处理猜测
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
        // 猜对了
        setWrongGuess(false);
        
        // 更新手牌
        const newHand = [...hand];
        newHand.splice(position, 0, hiddenCard);
        setHand(newHand);
        
        console.log('✅ Correct! New hand:', newHand);

        if (!over) {
          try {
            // 获取下一张卡
            const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
            console.log('🎴 Next card:', nextRes.data);
            setHiddenCard(nextRes.data);
            setRoundIndex(prev => prev + 1);
          } catch (nextErr) {
            console.error('Failed to get next card:', nextErr);
            setError('获取下一张卡片失败');
          }
        } else {
          // 游戏胜利
          console.log('🎉 Game won!');
          setHiddenCard(null);
        }
      } else {
        // 猜错了
        console.log('❌ Wrong guess!');
        setWrongGuess(true);
        setTimeout(() => setWrongGuess(false), 500);

        if (!over) {
          // 猜错后进入下一轮，获取新卡片
          try {
            const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
            console.log('🎴 Next card after wrong guess:', nextRes.data);
            setHiddenCard(nextRes.data);
            setRoundIndex(prev => prev + 1);
          } catch (nextErr) {
            console.error('Failed to get next card after wrong guess:', nextErr);
            setError('获取下一张卡片失败');
          }
        } else {
          // 游戏失败
          console.log('💀 Game lost!');
          setHiddenCard(null);
        }
      }
    } catch (err) {
      console.error('Error during guess:', err);
      setError('提交失败，请重试');
    }
  };

  // 超时处理 - 修复后的版本
  const handleTimeUp = async () => {
    console.log('⏰ Time up!');
    if (!hiddenCard || !currentGameId.current || isGameOver) return;
    
    try {
      // 首先尝试专门的超时API
      let res;
      try {
        res = await axios.post(`/api/games/${currentGameId.current}/timeout`, {
          cardId: hiddenCard.id,
        });
      } catch (timeoutErr) {
        // 如果没有专门的超时API，使用错误位置-1来表示超时
        console.log('⏰ Using fallback timeout handling');
        res = await axios.post(`/api/games/${currentGameId.current}/guess`, {
          position: -1, // -1表示超时
          cardId: hiddenCard.id,
        });
      }
      
      const {
        wrongCount: newWrongCount,
        isGameOver: over,
        finalStatus: status,
      } = res.data;

      console.log(`⏰ Timeout result:`, { newWrongCount, over, status });

      setWrongCount(newWrongCount);
      setIsGameOver(over);
      setFinalStatus(status);

      // 显示错误动画
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);

      if (!over) {
        try {
          // 超时后进入下一轮，获取新卡片
          const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
          console.log('🎴 Next card after timeout:', nextRes.data);
          setHiddenCard(nextRes.data);
          setRoundIndex(prev => prev + 1);
        } catch (nextErr) {
          console.error('Failed to get next card after timeout:', nextErr);
          setError('获取下一张卡片失败');
        }
      } else {
        // 游戏失败
        console.log('💀 Game lost due to timeout!');
        setHiddenCard(null);
      }
    } catch (err) {
      console.error('Error during timeout:', err);
      setError('超时处理失败');
    }
  };

  // 重新开始游戏
  const handleRestart = () => {
    console.log('🔄 Restarting game...');
    initialized.current = false;
    currentGameId.current = null;
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
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #ffffff40',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'white', fontSize: '1.2rem' }}>正在启动游戏...</p>
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
          <h2 style={{ color: '#e74c3c', marginBottom: '1rem' }}>⚠️ 出错了</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button
            onClick={handleRestart}
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
            🔄 重新开始
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
          maxWidth: '500px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {finalStatus === 'won' ? (
            <>
              <h2 style={{ color: '#27ae60', fontSize: '2rem', marginBottom: '1rem' }}>
                🎉 恭喜胜利！🎉
              </h2>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                您成功排列了所有卡片！<br/>
                失误次数：{wrongCount}/3
              </p>
            </>
          ) : (
            <>
              <h2 style={{ color: '#e74c3c', fontSize: '2rem', marginBottom: '1rem' }}>
                😔 游戏结束 😔
              </h2>
              <p style={{ marginBottom: '2rem', fontSize: '1.1rem' }}>
                您已经失误了 3 次<br/>
                不要灰心，再试一次！
              </p>
            </>
          )}
          
          <button
            onClick={handleRestart}
            style={{
              background: 'linear-gradient(45deg, #3498db, #2980b9)',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
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
          <span>游戏 #{gameId}</span>
          <span>失误: {wrongCount}/3</span>
          <span>手牌: {hand.length}/6</span>
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
            💡 <strong>提示</strong>：将 "<strong>{hiddenCard.title}</strong>" 拖拽到正确位置
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            记住：坏运指数越低越靠前！
          </p>
        </div>
      )}
    </div>
  );
}

// 添加旋转动画的CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);