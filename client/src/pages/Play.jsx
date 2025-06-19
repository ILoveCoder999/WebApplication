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
        // 猜对了 - 获得卡牌并加入手牌
        setWrongGuess(false);
        
        // 更新手牌
        const newHand = [...hand];
        newHand.splice(position, 0, hiddenCard);
        setHand(newHand);
        
        console.log('✅ Correct! Card added to hand:', newHand);

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
        // 猜错了 - 卡牌被丢弃，不加入手牌
        console.log('❌ Wrong guess! Card discarded.');
        setWrongGuess(true);
        setTimeout(() => setWrongGuess(false), 500);

        if (!over) {
          // 猜错后直接获取下一张新卡片，当前卡片被丢弃
          try {
            const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
            console.log('🎴 Next card after wrong guess (previous discarded):', nextRes.data);
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

  // 超时处理 - 卡牌被丢弃
  const handleTimeUp = async () => {
    console.log('⏰ Time up! Card will be discarded.');
    if (!hiddenCard || !currentGameId.current || isGameOver) return;
    
    try {
      // 超时处理：卡牌被丢弃，不加入手牌，增加错误计数
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

      console.log(`⏰ Timeout result: Card discarded, wrong count: ${newWrongCount}`);

      setWrongCount(newWrongCount);
      setIsGameOver(over);
      setFinalStatus(status);

      // 显示错误动画
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);

      if (!over) {
        try {
          // 超时后获取下一张新卡片，当前卡片被永久丢弃
          const nextRes = await axios.get(`/api/games/${currentGameId.current}/next`);
          console.log('🎴 Next card after timeout (previous discarded permanently):', nextRes.data);
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
  const handleStartNewGame = async () => {
    console.log('🔄 Starting new game...');
    
    try {
      setLoading(true);
      setError('');
      
      // 重置所有状态
      setGameId(null);
      setHand([]);
      setHiddenCard(null);
      setWrongCount(0);
      setIsGameOver(false);
      setFinalStatus('');
      setWrongGuess(false);
      setRoundIndex(0);
      
      // 创建新游戏
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

      // 获取第一张待猜卡
      const nextRes = await axios.get(`/api/games/${gameId}/next`, { withCredentials: true });
      console.log('🎴 First card:', nextRes.data);
      
      setHiddenCard(nextRes.data);
      setRoundIndex(0);
      setLoading(false);
    } catch (err) {
      console.error('Failed to start new game:', err);
      if (err.response?.status === 401) {
        setError('请先登录');
      } else {
        setError('启动新游戏失败，请重试');
      }
      setLoading(false);
    }
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
          maxWidth: '600px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {finalStatus === 'won' ? (
            <>
              <h2 style={{ color: '#27ae60', fontSize: '2.5rem', marginBottom: '1rem' }}>
                🎉 恭喜胜利！🎉
              </h2>
              <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                您成功完成了这轮游戏！
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #4caf50, #8bc34a)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                margin: '2rem 0',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>🏆 游戏统计</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hand.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>获得卡牌</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{wrongCount}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>失误次数</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>#{gameId}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>游戏编号</div>
                  </div>
                </div>
              </div>
              <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#7f8c8d' }}>
                您已成功收集了所有可能的卡牌！准备挑战新的一轮吗？
              </p>
            </>
          ) : (
            <>
              <h2 style={{ color: '#e74c3c', fontSize: '2.5rem', marginBottom: '1rem' }}>
                😔 游戏结束 😔
              </h2>
              <p style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>
                这轮游戏已结束
              </p>
              <div style={{
                background: 'linear-gradient(135deg, #ff9800, #ff5722)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '15px',
                margin: '2rem 0',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}>
                <h3 style={{ margin: '0 0 1rem 0' }}>📊 游戏统计</h3>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{hand.length}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>获得卡牌</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>3</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>失误次数</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>#{gameId}</div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>游戏编号</div>
                  </div>
                </div>
              </div>
              <p style={{ marginBottom: '2rem', fontSize: '1rem', color: '#7f8c8d' }}>
                不要灰心！每次游戏都是学习的机会。准备开始新的挑战吗？
              </p>
            </>
          )}
          
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
              {loading ? '🔄 启动中...' : '🎮 开始新游戏'}
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
              📊 查看统计
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
              🎯 练习模式
            </Link>
          </div>
          
          <p style={{ 
            marginTop: '2rem', 
            fontSize: '0.9rem', 
            color: '#95a5a6',
            fontStyle: 'italic'
          }}>
            💡 提示：每轮游戏都有不同的卡牌组合，继续挑战提升您的技巧！
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