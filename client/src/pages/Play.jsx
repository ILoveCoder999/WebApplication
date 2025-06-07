// File: client/src/pages/Play.jsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GameBoard from '../components/GameBoard.jsx';
import TimerBar from '../components/TimerBar.jsx';
import './Play.css';

export default function Play() {
  const [gameId, setGameId] = useState(null);
  const [hand, setHand] = useState([]);              // 当前手牌卡片数组
  const [hiddenCard, setHiddenCard] = useState(null); // 当前待猜卡
  const [wrongCount, setWrongCount] = useState(0);    // 已经猜错的次数
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStatus, setFinalStatus] = useState(''); // 'won' 或 'lost'
  const [wrongGuess, setWrongGuess] = useState(false); // 瞬时抖动红色效果

  // 这个值用于控制 TimerBar 每轮重置。当它 +1 时，TimerBar 会重新从 100% 开始计时。
  const [roundIndex, setRoundIndex] = useState(0);

  // —— 1. 初始化：创建新游戏、拿 3 张初始牌 和 第一张“待猜卡”
  useEffect(() => {
    async function startGame() {
      try {
        const res = await axios.post('/games');
        const { gameId, hand: initialHand } = res.data;
        setGameId(gameId);
        setHand(initialHand);

        // 拿第一张待猜卡
        const nextRes = await axios.get(`/games/${gameId}/next`);
        setHiddenCard(nextRes.data);

        // 第一轮倒计时：roundIndex = 0
        setRoundIndex(0);
      } catch (err) {
        console.error('Failed to start game:', err);
      }
    }
    startGame();
  }, []);

  // —— 2. 处理“猜”逻辑：拖拽到某个位置 或 超时后，都会来到这里
  const handleGuess = async (position) => {
    // 如果游戏还没开始、或已结束，就直接 return
    if (!hiddenCard || gameId === null || isGameOver) return;

    try {
      // 向后端 /api/games/:id/guess 发送 { position, cardId }
      // 如果 position = -1 （超时），后端也会把它判为“错误”
      const res = await axios.post(`/games/${gameId}/guess`, {
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
        // 猜对：取消红色抖动
        setWrongGuess(false);

        // 把 hiddenCard 插到手牌里，然后按 badLuckIdx 排序
        const newHand = [...hand];
        newHand.splice(position, 0, hiddenCard);
        setHand(newHand);

        if (!over) {
          // 若尚未结束，拿下一张待猜卡
          const nextRes = await axios.get(`/games/${gameId}/next`);
          setHiddenCard(nextRes.data);

          // 本轮结束，进入下一轮：重置倒计时
          setRoundIndex((prev) => prev + 1);
        } else {
          // 游戏胜利，不再有新的 hiddenCard
          setHiddenCard(null);
        }
      } else {
        // 猜错（包括超时）：抖动红色
        setWrongGuess(true);
        // 500ms 后取消抖动效果
        setTimeout(() => setWrongGuess(false), 500);

        if (!over) {
          // 如果还没失败 3 次，则给同一张卡再一次机会：更换倒计时
          setRoundIndex((prev) => prev + 1);
        } else {
          // 累计 3 次失败，游戏结束
          setHiddenCard(null);
        }
      }
    } catch (err) {
      console.error('Error during guess:', err);
    }
  };

  // —— 3. 倒计时结束的回调：相当于一次“猜错误”传 position = -1
  const handleTimeUp = () => {
    if (!hiddenCard || gameId === null || isGameOver) return;
    handleGuess(-1);
  };

  // —— 4. 渲染逻辑
  if (gameId === null) {
    return <div className="play-page">Starting game...</div>;
  }

  if (isGameOver) {
    return (
      <div className="play-page">
        {finalStatus === 'won' ? (
          <h2 className="result-message">🎉 You Won! 🎉</h2>
        ) : (
          <h2 className="result-message">😢 You Lost! 😢</h2>
        )}
        <button
          className="btn-restart"
          onClick={() => {
            window.location.reload();
          }}
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="play-page">
      <h2 className="play-header">Stuff Happens — Game in Progress</h2>
      <p className="status-text">Mistakes: {wrongCount} / 3</p>

      {/* —— 倒计时条 —— */}
      <TimerBar
        duration={30}         /* 30 秒倒计时 */
        onTimeUp={handleTimeUp} 
        resetSignal={roundIndex}
      />

      {/* —— 手牌 + 隐藏卡 拖拽区域 —— */}
      <GameBoard
        hand={hand}
        hiddenCard={hiddenCard}
        wrongGuess={wrongGuess}
        onDrop={(position) => handleGuess(position)}
      />
    </div>
  );
}
