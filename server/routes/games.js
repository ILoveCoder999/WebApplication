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
  try {
    // 插入新游戏
    const gameStmt = db.prepare(`
      INSERT INTO games (userId, startedAt, status, wrongCount) 
      VALUES (?, ?, ?, ?)
    `);
    const result = gameStmt.run(req.session.userId, new Date().toISOString(), 'ongoing', 0);
    const gameId = result.lastInsertRowid;

    // 随机取 3 张卡作为初始手牌，按 badLuckIdx 排序
    const cards = db.prepare(`
      SELECT * FROM cards 
      ORDER BY RANDOM() 
      LIMIT 3
    `).all();
    
    // 按 badLuckIdx 排序
    cards.sort((a, b) => a.badLuckIdx - b.badLuckIdx);
    
    // 插入到 rounds 表
    cards.forEach((card, i) => {
      db.prepare(`
        INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect) 
        VALUES (?, ?, ?, ?)
      `).run(gameId, card.id, i, 1);
    });

    console.log(`✅ Game ${gameId} created with cards:`, cards.map(c => `${c.title} (${c.badLuckIdx})`));
    res.json({ gameId, hand: cards });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Failed to create game' });
  }
});

router.get('/games', auth, (req, res) => {
  try {
    const games = db.prepare('SELECT * FROM games WHERE userId = ?').all(req.session.userId);
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
});


// 2. 获取下一张"待猜卡"（随机一张卡）
router.get('/games/:id/next', auth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    
    // 验证游戏是否存在且属于当前用户
    const game = db.prepare(`
      SELECT * FROM games 
      WHERE id = ? AND userId = ? AND status = 'ongoing'
    `).get(gameId, req.session.userId);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found or finished' });
    }
    
    // 获取已经使用过的卡片ID
    const usedCardIds = db.prepare(`
      SELECT DISTINCT cardId FROM rounds WHERE gameId = ?
    `).all(gameId).map(row => row.cardId);
    
    // 获取一张未使用的随机卡片
    let nextCard;
    if (usedCardIds.length > 0) {
      const placeholders = usedCardIds.map(() => '?').join(',');
      nextCard = db.prepare(`
        SELECT * FROM cards 
        WHERE id NOT IN (${placeholders})
        ORDER BY RANDOM() 
        LIMIT 1
      `).get(...usedCardIds);
    } else {
      nextCard = db.prepare(`
        SELECT * FROM cards 
        ORDER BY RANDOM() 
        LIMIT 1
      `).get();
    }
    
    if (!nextCard) {
      return res.status(404).json({ message: 'No more cards available' });
    }
    
    console.log(`🎴 Next card for game ${gameId}: ${nextCard.title} (${nextCard.badLuckIdx})`);
    res.json(nextCard);
  } catch (error) {
    console.error('Error getting next card:', error);
    res.status(500).json({ message: 'Failed to get next card' });
  }
});

// 3. 提交本回合"猜测"
router.post('/games/:id/guess', auth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    const { position, cardId } = req.body;

    // 验证输入
    if (typeof position !== 'number' || !cardId) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // 验证游戏是否存在且未结束
    const game = db.prepare(`
      SELECT * FROM games 
      WHERE id = ? AND userId = ? AND status = 'ongoing'
    `).get(gameId, req.session.userId);
    
    if (!game) {
      return res.status(400).json({ message: 'Game not found or already finished' });
    }

    // 查询当前"已猜对"的手牌
    const correctRounds = db.prepare(`
      SELECT r.cardId, r.orderNo, c.badLuckIdx
      FROM rounds r
      JOIN cards c ON r.cardId = c.id
      WHERE r.gameId = ? AND r.guessedCorrect = 1
      ORDER BY r.orderNo
    `).all(gameId);

    const handSize = correctRounds.length;

    // 查询待猜卡的 badLuckIdx
    const newCard = db.prepare('SELECT badLuckIdx FROM cards WHERE id = ?').get(cardId);
    if (!newCard) {
      return res.status(400).json({ message: 'Invalid cardId' });
    }
    const newIdx = newCard.badLuckIdx;

    // 判断插卡是否正确
    let isCorrect = false;
    if (position === -1) {
      // 超时
      isCorrect = false;
    } else if (handSize === 0) {
      isCorrect = true;
    } else if (position === 0) {
      isCorrect = newIdx <= correctRounds[0].badLuckIdx;
    } else if (position >= handSize) {
      isCorrect = correctRounds[handSize - 1].badLuckIdx <= newIdx;
    } else {
      const leftIdx = correctRounds[position - 1].badLuckIdx;
      const rightIdx = correctRounds[position].badLuckIdx;
      isCorrect = leftIdx <= newIdx && newIdx <= rightIdx;
    }

    // 记录本回合
    const guessed = isCorrect ? 1 : 0;
    const insertPosition = position === -1 ? handSize : position; // 超时时放在最后
    
    db.prepare(`
      INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect) 
      VALUES (?, ?, ?, ?)
    `).run(gameId, cardId, insertPosition, guessed);

    // 更新游戏状态
    let updatedWrongCount = game.wrongCount;
    let finalStatus = game.status;
    let isGameOver = false;

    if (!isCorrect) {
      updatedWrongCount += 1;
      if (updatedWrongCount >= 3) {
        finalStatus = 'lost';
        isGameOver = true;
      }
    } else {
      // 检查是否胜利 (6张卡片)
      if (handSize + 1 >= 6) {
        finalStatus = 'won';
        isGameOver = true;
      }
    }

    // 更新数据库
    if (isGameOver) {
      db.prepare(`
        UPDATE games 
        SET status = ?, endedAt = ?, wrongCount = ? 
        WHERE id = ?
      `).run(finalStatus, new Date().toISOString(), updatedWrongCount, gameId);
    } else {
      db.prepare(`
        UPDATE games 
        SET wrongCount = ? 
        WHERE id = ?
      `).run(updatedWrongCount, gameId);
    }

    const logMessage = position === -1 ? 
      `⏰ Game ${gameId}: TIMEOUT` : 
      `${isCorrect ? '✅' : '❌'} Game ${gameId}: ${isCorrect ? 'CORRECT' : 'WRONG'} guess at position ${position}`;
    console.log(logMessage);

    res.json({
      correct: isCorrect,
      wrongCount: updatedWrongCount,
      isGameOver,
      finalStatus,
      handSize: handSize + (isCorrect ? 1 : 0)
    });
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: 'Failed to process guess' });
  }
});

// 4. 查询历史：返回当前用户所有局
router.get('/games/history', auth, (req, res) => {
  try {
    const games = db.prepare(`
      SELECT 
        id,
        status,
        wrongCount,
        startedAt,
        endedAt
      FROM games 
      WHERE userId = ? 
      ORDER BY startedAt DESC
      LIMIT 20
    `).all(req.session.userId);
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Failed to fetch game history' });
  }
});

export default router;