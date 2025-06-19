// File: server/routes/user.js

import express from 'express';
import { db, queries } from '../db/init.js';

const router = express.Router();

// 验证用户是否已登录
function requireAuth(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
}

// 获取用户统计信息
router.get('/stats', requireAuth, (req, res) => {
  try {
    const stats = queries.getUserStats.get(req.user.id);
    
    // 计算胜率
    const winRate = stats.totalGames > 0 ? 
      ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;
    
    // 获取总收集卡牌数
    const totalCards = db.prepare(`
      SELECT COUNT(*) as count FROM rounds r
      JOIN games g ON r.gameId = g.id
      WHERE g.userId = ? AND r.guessedCorrect = 1
    `).get(req.user.id);

    res.json({
      ...stats,
      winRate: parseFloat(winRate),
      totalCardsCollected: totalCards.count,
      averageCardsPerGame: stats.totalGames > 0 ? 
        (totalCards.count / stats.totalGames).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});

// 获取用户的游戏历史（兼容旧的API路径）
router.get('/games', requireAuth, (req, res) => {
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
        SELECT c.id, c.title, c.badLuckIdx, r.orderNo, r.guessedCorrect, r.position
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
    console.error('Error fetching user games:', error);
    res.status(500).json({ message: 'Failed to fetch user games' });
  }
});

// 获取用户信息
router.get('/profile', requireAuth, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, username, createdAt, lastLoginAt 
      FROM users 
      WHERE id = ?
    `).get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 获取统计信息
    const stats = queries.getUserStats.get(req.user.id);
    const winRate = stats.totalGames > 0 ? 
      ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;

    res.json({
      ...user,
      stats: {
        ...stats,
        winRate: parseFloat(winRate)
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

// 更新用户最后登录时间
router.post('/login-update', requireAuth, (req, res) => {
  try {
    db.prepare(`
      UPDATE users 
      SET lastLoginAt = datetime('now') 
      WHERE id = ?
    `).run(req.user.id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating login time:', error);
    res.status(500).json({ message: 'Failed to update login time' });
  }
});

// 删除用户账户（可选功能）
router.delete('/account', requireAuth, (req, res) => {
  try {
    const { password } = req.body;
    
    // 验证密码
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE id = ? AND password = ?
    `).get(req.user.id, password);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // 删除用户（CASCADE 会自动删除相关的games和rounds）
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    
    // 销毁会话
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
      res.json({ success: true, message: 'Account deleted successfully' });
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// 获取用户的最佳成绩
router.get('/achievements', requireAuth, (req, res) => {
  try {
    // 最高收集卡牌数的游戏
    const bestGame = db.prepare(`
      SELECT 
        g.id,
        g.status,
        g.wrongCount,
        g.startedAt,
        g.endedAt,
        (
          SELECT COUNT(*) FROM rounds r1 
          WHERE r1.gameId = g.id AND r1.guessedCorrect = 1
        ) as totalCards
      FROM games g
      WHERE g.userId = ?
      ORDER BY totalCards DESC, wrongCount ASC
      LIMIT 1
    `).get(req.user.id);

    // 最快胜利的游戏
    const fastestWin = db.prepare(`
      SELECT 
        id,
        startedAt,
        endedAt,
        (julianday(endedAt) - julianday(startedAt)) * 24 * 60 as durationMinutes
      FROM games
      WHERE userId = ? AND status = 'won' AND endedAt IS NOT NULL
      ORDER BY durationMinutes ASC
      LIMIT 1
    `).get(req.user.id);

    // 连胜记录
    const games = db.prepare(`
      SELECT status, startedAt FROM games 
      WHERE userId = ? 
      ORDER BY startedAt DESC
    `).all(req.user.id);
    
    let currentStreak = 0;
    let maxStreak = 0;
    let tempStreak = 0;
    
    for (const game of games) {
      if (game.status === 'won') {
        tempStreak++;
        maxStreak = Math.max(maxStreak, tempStreak);
        if (currentStreak === 0) currentStreak = tempStreak;
      } else {
        tempStreak = 0;
        if (currentStreak > 0) currentStreak = 0;
      }
    }

    res.json({
      bestGame,
      fastestWin: fastestWin ? {
        ...fastestWin,
        durationFormatted: `${Math.floor(fastestWin.durationMinutes)}:${Math.floor((fastestWin.durationMinutes % 1) * 60).toString().padStart(2, '0')}`
      } : null,
      streaks: {
        current: Math.max(0, currentStreak),
        max: maxStreak
      }
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

export default router;