// File: server/routes/games.js

import express from 'express';
import { db } from '../db/init.js';

const router = express.Router();

// 验证用户是否已登录
function auth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'login required' });
  }
  next();
}

// 1. 创建一局游戏，返回初始 3 张卡
router.post('/games', auth, (req, res) => {
  // 插入新游戏
  const gameStmt = db.prepare(`
    INSERT INTO games (userId, startedAt, status, wrongCount) 
    VALUES (?, ?, ?, ?)
  `);
  const result = gameStmt.run(req.session.userId, new Date().toISOString(), 'ongoing', 0);
  const gameId = result.lastInsertRowid;

  // 随机取 3 张卡作为初始手牌
  const cards = db.prepare('SELECT * FROM cards ORDER BY RANDOM() LIMIT 3').all();
  cards.forEach((c, i) => {
    db.prepare(`
      INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect) 
      VALUES (?, ?, ?, ?)
    `).run(gameId, c.id, i, 1);
  });

  res.json({ gameId, hand: cards });
});


// 2. 获取下一张“待猜卡”（随机一张卡）
router.get('/games/:id/next', auth, (req, res) => {
  const nextCard = db.prepare('SELECT * FROM cards ORDER BY RANDOM() LIMIT 1').get();
  res.json(nextCard);
});


// 3. 提交本回合“猜测”
//    请求 body: { position: number, cardId: number }
router.post('/games/:id/guess', auth, (req, res) => {
  const gameId = Number(req.params.id);
  const { position, cardId } = req.body;

  // —— 3.1 验证游戏是否存在且未结束 —— 
  const game = db.prepare('SELECT * FROM games WHERE id = ?').get(gameId);
  if (!game || game.status !== 'ongoing') {
    return res.status(400).json({ message: 'Game not found or already finished' });
  }

  // —— 3.2 查询当前“已猜对”的手牌 —— 
  const correctRounds = db.prepare(`
    SELECT cardId, orderNo 
    FROM rounds 
    WHERE gameId = ? AND guessedCorrect = 1
    ORDER BY orderNo
  `).all(gameId);

  const handSize = correctRounds.length;

  // 将已猜对的手牌依次转为 { cardId, badLuckIdx, orderNo }
  const handBadLuck = correctRounds.map(r => {
    const card = db.prepare('SELECT badLuckIdx FROM cards WHERE id = ?').get(r.cardId);
    return {
      cardId: r.cardId,
      badLuckIdx: card.badLuckIdx,
      orderNo: r.orderNo
    };
  });

  // —— 3.3 查询待猜卡的 badLuckIdx —— 
  const newCard = db.prepare('SELECT badLuckIdx FROM cards WHERE id = ?').get(cardId);
  if (!newCard) {
    return res.status(400).json({ message: 'Invalid cardId' });
  }
  const newIdx = newCard.badLuckIdx;

  // —— 3.4 判断插卡是否正确 —— 
  let isCorrect = false;
  if (handSize === 0) {
    isCorrect = true; // 理论上不会出现，但做保险处理
  } else if (position === 0) {
    isCorrect = newIdx <= handBadLuck[0].badLuckIdx;
  } else if (position === handSize) {
    isCorrect = handBadLuck[handSize - 1].badLuckIdx <= newIdx;
  } else {
    const leftIdx = handBadLuck[position - 1].badLuckIdx;
    const rightIdx = handBadLuck[position].badLuckIdx;
    isCorrect = leftIdx <= newIdx && newIdx <= rightIdx;
  }

  // —— 3.5 将本回合写入 rounds 表 —— 
  const guessed = isCorrect ? 1 : 0;
  db.prepare(`
    INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect) 
    VALUES (?, ?, ?, ?)
  `).run(gameId, cardId, position, guessed);

  // —— 3.6 更新 wrongCount & status（如有必要） —— 
  let updatedWrongCount = game.wrongCount;
  let finalStatus = game.status;      // 'ongoing' / 'won' / 'lost'
  let isGameOver = false;

  if (!isCorrect) {
    updatedWrongCount += 1;
    if (updatedWrongCount >= 3) {
      finalStatus = 'lost';
      isGameOver = true;
    }
  } else {
    // 猜对了：如果手牌张数 + 1 达到 6 张，则胜利
    if (handSize + 1 >= 6) {
      finalStatus = 'won';
      isGameOver = true;
    }
  }

  if (isGameOver) {
    db.prepare(`
      UPDATE games 
      SET status = ?, endedAt = ? 
      WHERE id = ?
    `).run(finalStatus, new Date().toISOString(), gameId);
  } else if (!isCorrect) {
    // 只增加错误次数
    db.prepare(`
      UPDATE games 
      SET wrongCount = ? 
      WHERE id = ?
    `).run(updatedWrongCount, gameId);
  }

  // —— 3.7 返回给前端的 JSON —— 
  res.json({
    correct: isCorrect,
    wrongCount: isCorrect ? updatedWrongCount : updatedWrongCount, 
    isGameOver,
    finalStatus,
    handSize: handSize + (isCorrect ? 1 : 0)
  });
});


// 4. 查询历史：返回当前用户所有局
router.get('/games/history', auth, (req, res) => {
  const games = db.prepare('SELECT * FROM games WHERE userId = ?').all(req.session.userId);
  res.json(games);
});

export default router;

