import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameBoard from '../components/GameBoard.jsx';
import TimerBar from '../components/TimerBar.jsx';
import './DemoPage.css';

// 导入图片资源
import missedFlightImg from '../assets/images/1missed-flight.png';
import lostLuggageImg from '../assets/images/2lost-luggage.png';  
import passportIssueImg from '../assets/images/3passport-issue.png';
import hotelFullImg from '../assets/images/4hotel-full.png';


// 演示用的模拟数据 - 使用旅行相关的倒霉事件
const DEMO_INITIAL_HAND = [
  { id: 'demo1', title: '错过航班', imgUrl: missedFlightImg, badLuckIdx: 15.2 },
  { id: 'demo2', title: '行李丢失', imgUrl: lostLuggageImg, badLuckIdx: 25.8 },
  { id: 'demo3', title: '护照问题', imgUrl: passportIssueImg, badLuckIdx: 45.6 }
];

const DEMO_HIDDEN_CARD = {
  id: 'demo4', 
  title: '酒店客满', 
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

  const handleStartGame = () => {
    setGameState('playing');
    setTimerKey(prev => prev + 1); // 重置计时器
  };

  const handleGuess = (position) => {
    if (gameState !== 'playing') return;

    setUserGuess(position);
    
    // 检查答案：正确答案应该是位置2（在25.8和45.6之间）
    const correctPosition = 2;
    
    if (position === correctPosition) {
      // 答对了 - 获得卡牌并加入手牌
      setGameState('correct');
      setWrongGuess(false);
      
      // 更新手牌显示
      const newHand = [...hand];
      newHand.splice(position, 0, hiddenCard);
      setHand(newHand);
      setHiddenCard(null);
    } else {
      // 答错了 - 卡牌被丢弃，不加入手牌
      setGameState('wrong');
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);
      // 注意：手牌不更新，卡牌被丢弃
    }
  };

  const handleTimeUp = () => {
    if (gameState === 'playing') {
      // 超时 - 卡牌被丢弃，不加入手牌
      setGameState('timeout');
      setWrongGuess(true);
      setTimeout(() => setWrongGuess(false), 500);
      // 注意：手牌不更新，卡牌被永久丢弃
    }
  };

  const resetDemo = () => {
    // 重置到游戏开始前的状态，让玩家确认是否要重新开始
    setGameState('intro');
    setHand(DEMO_INITIAL_HAND);
    setHiddenCard(DEMO_HIDDEN_CARD);
    setWrongGuess(false);
    setUserGuess(null);
  };

  const handlePlayAgain = () => {
    // 直接开始新游戏，不回到介绍页面
    setGameState('playing');
    setHand(DEMO_INITIAL_HAND);
    setHiddenCard(DEMO_HIDDEN_CARD);
    setWrongGuess(false);
    setUserGuess(null);
    setTimerKey(prev => prev + 1); // 重置计时器
  };

  if (gameState === 'intro') {
    return (
      <div className="demo-page">
        <div className="demo-intro">
          <h1 className="demo-title">🎮 Stuff Happens - 演示版</h1>
          <div className="demo-explanation">
            <h2>演示说明</h2>
            <p>这是一个单轮演示，帮助您了解游戏玩法：</p>
            <ul className="demo-rules">
              <li>您将看到3张已排序的卡片，显示它们的坏运指数</li>
              <li>需要将新出现的卡片拖拽到正确位置</li>
              <li>记住：坏运指数越低 = 越不倒霉 = 越靠前</li>
              <li>您有30秒时间做决定</li>
              <li><strong>重要：</strong>如果答错或超时，卡牌将被永久丢弃</li>
            </ul>
            
            <div className="current-hand-preview">
              <h3>当前手牌预览：</h3>
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
              <h3>挑战卡片：</h3>
              <div className="preview-card challenge">
                <span className="preview-title">{DEMO_HIDDEN_CARD.title}</span>
                <span className="preview-question">坏运指数：???</span>
              </div>
              <p className="challenge-hint">
                想想看，"{DEMO_HIDDEN_CARD.title}"应该插入到哪个位置？
              </p>
              <p style={{ color: '#ffeb3b', fontWeight: 'bold', marginTop: '1rem' }}>
                ⚠️ 注意：答错或超时将失去这张卡片！
              </p>
            </div>
          </div>

          <button onClick={handleStartGame} className="btn-start-demo">
            开始演示游戏 🚀
          </button>
          
          <div className="demo-footer">
            <Link to="/rules" className="link-rules">📖 查看完整规则</Link>
            <Link to="/" className="link-login">🔑 登录玩完整版</Link>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'correct') {
    return (
      <div className="demo-page">
        <div className="demo-result success">
          <h2>🎉 恭喜答对了！</h2>
          <p>"{DEMO_HIDDEN_CARD.title}"的坏运指数是 <strong>{DEMO_HIDDEN_CARD.badLuckIdx}</strong></p>
          <p>您正确地将它放在了第 {userGuess + 1} 个位置！</p>
          <p style={{ color: '#e8f5e8', fontWeight: 'bold' }}>✅ 卡片已加入您的手牌</p>
          
          <div className="final-hand">
            <h3>最终排序：</h3>
            <div className="hand-display">
              {hand.map((card, idx) => (
                <div key={card.id} className="result-card">
                  <span className="card-position">{idx + 1}</span>
                  <span className="card-title">{card.title}</span>
                  <span className="card-index">{card.badLuckIdx}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '10px',
            margin: '2rem 0',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🎮 演示完成！</h3>
            <p style={{ marginBottom: '1rem' }}>
              您已经体验了基本的游戏玩法。准备尝试完整版游戏了吗？
            </p>
          </div>

          <div className="demo-complete-actions">
            <button onClick={handlePlayAgain} className="btn-retry">
              🔄 再试一次演示
            </button>
            <Link to="/rules" className="btn-rules">
              📖 查看完整规则
            </Link>
            <Link to="/" className="btn-register">
              🎮 开始完整游戏
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
          <h2>😅 {gameState === 'timeout' ? '时间到了！' : '答错了！'}</h2>
          <p>"{DEMO_HIDDEN_CARD.title}"的坏运指数是 <strong>{DEMO_HIDDEN_CARD.badLuckIdx}</strong></p>
          <p style={{ color: '#ffcdd2', fontWeight: 'bold' }}>
            ❌ 卡片已被永久丢弃，无法获得
          </p>
          <p>正确答案：应该放在第 3 个位置（在 25.8 和 45.6 之间）</p>
          
          <div className="explanation">
            <h3>解释：</h3>
            <p>卡片应该按坏运指数从低到高排列：</p>
            <div className="correct-order">
              <div className="order-item">错过航班 (15.2)</div>
              <div className="order-item">行李丢失 (25.8)</div>
              <div className="order-item highlight">→ 酒店客满 (32.4) ← 应在此位置</div>
              <div className="order-item">护照问题 (45.6)</div>
            </div>
            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
              💡 在真实游戏中，{gameState === 'timeout' ? '超时' : '猜错'}会使卡片永久消失，
              您将无法再次见到它，这会影响最终的手牌完整度。
            </p>
          </div>

          <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '1.5rem',
            borderRadius: '10px',
            margin: '2rem 0',
            backdropFilter: 'blur(10px)'
          }}>
            <h3>🎮 演示完成！</h3>
            <p style={{ marginBottom: '1rem' }}>
              虽然这次没有成功，但您已经了解了游戏的基本玩法和后果。
              准备挑战完整版游戏了吗？
            </p>
          </div>

          <div className="demo-complete-actions">
            <button onClick={handlePlayAgain} className="btn-retry">
              🔄 再试一次演示
            </button>
            <Link to="/rules" className="btn-rules">
              📖 学习完整规则
            </Link>
            <Link to="/" className="btn-register">
              🎮 开始完整游戏
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 游戏进行中
  return (
    <div className="demo-page">
      <div className="demo-game-header">
        <h2>🎮 演示游戏进行中</h2>
        <p>将 "{hiddenCard.title}" 拖拽到正确位置</p>
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
        <p>💡 提示：观察已有卡片的坏运指数，思考新卡片应该在哪里</p>
        <p style={{ color: '#d32f2f', fontWeight: 'bold', marginTop: '0.5rem' }}>
          ⚠️ 注意：答错或超时将永久失去这张卡片！
        </p>
      </div>
    </div>
  );
}