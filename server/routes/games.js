// File: server/routes/games.js

import express from 'express';
import { db } from '../db/init.js';

const router = express.Router();

// 验证用户是否已登录
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// 提取猜测逻辑为单独函数
function processGuess(gameId, userId, position, cardId) {
  // 验证游戏是否存在且未结束
  const game = db.prepare(`
    SELECT * FROM games 
    WHERE id = ? AND userId = ? AND status = 'ongoing'
  `).get(gameId, userId);
  
  if (!game) {
    throw new Error('Game not found or already finished');
  }

  // 查询当前"已猜对"的手牌（不包括初始卡牌）
  const correctRounds = db.prepare(`
    SELECT r.cardId, r.orderNo, c.badLuckIdx
    FROM rounds r
    JOIN cards c ON r.cardId = c.id
    WHERE r.gameId = ? AND r.guessedCorrect = 1 AND r.orderNo >= 0
    ORDER BY r.orderNo
  `).all(gameId);

  // 获取初始手牌
  const initialCards = db.prepare(`
    SELECT r.cardId, c.title, c.badLuckIdx
    FROM rounds r
    JOIN cards c ON r.cardId = c.id
    WHERE r.gameId = ? AND r.orderNo = -1
    ORDER BY c.badLuckIdx
  `).all(gameId);

  const currentHandSize = initialCards.length + correctRounds.length;

  // 查询待猜卡的 badLuckIdx
  const newCard = db.prepare('SELECT badLuckIdx FROM cards WHERE id = ?').get(cardId);
  if (!newCard) {
    throw new Error('Invalid cardId');
  }
  const newIdx = newCard.badLuckIdx;

  // 构建当前完整手牌（初始卡牌 + 已猜对的卡牌）
  const fullHand = [...initialCards, ...correctRounds.map(r => ({ badLuckIdx: r.badLuckIdx }))];
  fullHand.sort((a, b) => a.badLuckIdx - b.badLuckIdx);

  // 判断插卡是否正确
  let isCorrect = false;
  if (position === -1) {
    // 超时
    isCorrect = false;
  } else if (fullHand.length === 0) {
    isCorrect = true;
  } else if (position === 0) {
    isCorrect = newIdx <= fullHand[0].badLuckIdx;
  } else if (position >= fullHand.length) {
    isCorrect = fullHand[fullHand.length - 1].badLuckIdx <= newIdx;
  } else {
    const leftIdx = fullHand[position - 1].badLuckIdx;
    const rightIdx = fullHand[position].badLuckIdx;
    isCorrect = leftIdx <= newIdx && newIdx <= rightIdx;
  }

  // 获取当前轮次编号
  const currentRound = db.prepare(`
    SELECT COUNT(*) as count FROM rounds 
    WHERE gameId = ? AND orderNo >= 0
  `).get(gameId).count;

  // 记录本回合
  const guessed = isCorrect ? 1 : 0;
  
  db.prepare(`
    INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect, position) 
    VALUES (?, ?, ?, ?, ?)
  `).run(gameId, cardId, currentRound, guessed, position);

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
    // 检查是否胜利 (6张卡片：3张初始 + 3张猜对)
    if (currentHandSize + 1 >= 6) {
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

  return {
    correct: isCorrect,
    wrongCount: updatedWrongCount,
    isGameOver,
    finalStatus,
    handSize: currentHandSize + (isCorrect ? 1 : 0),
    roundNumber: currentRound
  };
}

// 1. 创建一局游戏，返回初始 3 张卡
router.post('/games', requireAuth, (req, res) => {
  try {
    // 插入新游戏
    const gameStmt = db.prepare(`
      INSERT INTO games (userId, startedAt, status, wrongCount) 
      VALUES (?, ?, ?, ?)
    `);
    const result = gameStmt.run(req.user.id, new Date().toISOString(), 'ongoing', 0);
    const gameId = result.lastInsertRowid;

    // 随机取 3 张卡作为初始手牌，按 badLuckIdx 排序
    const cards = db.prepare(`
      SELECT * FROM cards 
      ORDER BY RANDOM() 
      LIMIT 3
    `).all();
    
    // 按 badLuckIdx 排序
    cards.sort((a, b) => a.badLuckIdx - b.badLuckIdx);
    
    // 插入到 rounds 表，使用 orderNo = -1 表示初始手牌
    cards.forEach((card, i) => {
      db.prepare(`
        INSERT INTO rounds (gameId, cardId, orderNo, guessedCorrect, position) 
        VALUES (?, ?, ?, ?, ?)
      `).run(gameId, card.id, -1, 1, null); // orderNo = -1 表示初始卡牌
    });

    console.log(`✅ Game ${gameId} created with initial cards:`, cards.map(c => `${c.title} (${c.badLuckIdx})`));
    res.json({ gameId, hand: cards });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Failed to create game' });
  }
});

router.get('/games', requireAuth, (req, res) => {
  try {
    const games = db.prepare('SELECT * FROM games WHERE userId = ?').all(req.user.id);
    res.json(games);
  } catch (error) {
    console.error('Error fetching games:', error);
    res.status(500).json({ message: 'Failed to fetch games' });
  }
});

// 2. 获取下一张"待猜卡"（随机一张卡）
router.get('/games/:id/next', requireAuth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    
    // 验证游戏是否存在且属于当前用户
    const game = db.prepare(`
      SELECT * FROM games 
      WHERE id = ? AND userId = ? AND status = 'ongoing'
    `).get(gameId, req.user.id);
    
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
router.post('/games/:id/guess', requireAuth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    const { position, cardId } = req.body;

    // 验证输入
    if (typeof position !== 'number' || !cardId) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const result = processGuess(gameId, req.user.id, position, cardId);

    const logMessage = position === -1 ? 
      `⏰ Game ${gameId}: TIMEOUT - Round ${result.roundNumber}` : 
      `${result.correct ? '✅' : '❌'} Game ${gameId}: ${result.correct ? 'CORRECT' : 'WRONG'} guess at position ${position} - Round ${result.roundNumber}`;
    console.log(logMessage);

    res.json(result);
  } catch (error) {
    console.error('Error processing guess:', error);
    res.status(500).json({ message: error.message || 'Failed to process guess' });
  }
});

// 4. 查询历史：返回当前用户所有局的详细信息
router.get('/games/history', requireAuth, (req, res) => {
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
      LIMIT 50
    `).all(req.user.id);
    
    // 为每个游戏获取详细的卡牌信息
    const gamesWithDetails = games.map(game => {
      // 获取初始卡牌（orderNo = -1）
      const initialCards = db.prepare(`
        SELECT c.id, c.title, c.badLuckIdx, r.orderNo, r.guessedCorrect
        FROM rounds r
        JOIN cards c ON r.cardId = c.id
        WHERE r.gameId = ? AND r.orderNo = -1
        ORDER BY c.badLuckIdx
      `).all(game.id);

      // 获取游戏过程中的卡牌（orderNo >= 0）
      const gameCards = db.prepare(`
        SELECT c.id, c.title, c.badLuckIdx, r.orderNo, r.guessedCorrect
        FROM rounds r
        JOIN cards c ON r.cardId = c.id
        WHERE r.gameId = ? AND r.orderNo >= 0
        ORDER BY r.orderNo
      `).all(game.id);

      // 统计信息
      const totalCards = initialCards.length + gameCards.filter(c => c.guessedCorrect === 1).length;
      const totalRounds = gameCards.length;
      const wonRounds = gameCards.filter(c => c.guessedCorrect === 1).length;

      return {
        ...game,
        initialCards,
        gameCards,
        stats: {
          totalCards,
          totalRounds,
          wonRounds,
          lostRounds: totalRounds - wonRounds
        }
      };
    });
    
    res.json(gamesWithDetails);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Failed to fetch game history' });
  }
});

// 5. 获取特定游戏的详细信息
router.get('/games/:id/details', requireAuth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    
    // 获取游戏基本信息
    const game = db.prepare(`
      SELECT * FROM games 
      WHERE id = ? AND userId = ?
    `).get(gameId, req.user.id);
    
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // 获取初始卡牌
    const initialCards = db.prepare(`
      SELECT c.id, c.title, c.badLuckIdx, r.orderNo, r.guessedCorrect
      FROM rounds r
      JOIN cards c ON r.cardId = c.id
      WHERE r.gameId = ? AND r.orderNo = -1
      ORDER BY c.badLuckIdx
    `).all(gameId);

    // 获取游戏轮次卡牌
    const gameCards = db.prepare(`
      SELECT c.id, c.title, c.badLuckIdx, r.orderNo, r.guessedCorrect, r.position
      FROM rounds r
      JOIN cards c ON r.cardId = c.id
      WHERE r.gameId = ? AND r.orderNo >= 0
      ORDER BY r.orderNo
    `).all(gameId);

    res.json({
      ...game,
      initialCards,
      gameCards
    });
  } catch (error) {
    console.error('Error fetching game details:', error);
    res.status(500).json({ message: 'Failed to fetch game details' });
  }
});

// 6. 超时处理专用API
router.post('/games/:id/timeout', requireAuth, (req, res) => {
  try {
    const gameId = Number(req.params.id);
    const { cardId } = req.body;

    if (!cardId) {
      return res.status(400).json({ message: 'Card ID is required' });
    }

    // 使用 position = -1 表示超时
    const result = processGuess(gameId, req.user.id, -1, cardId);
    
    console.log(`⏰ Game ${gameId}: TIMEOUT handled - Round ${result.roundNumber}`);
    res.json(result);
  } catch (error) {
    console.error('Error handling timeout:', error);
    res.status(500).json({ message: error.message || 'Failed to handle timeout' });
  }
});

export default router;