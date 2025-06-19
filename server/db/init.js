// File: server/db/init.js

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcrypt';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'stuff.db');
const firstRun = !fs.existsSync(dbPath);

export const db = new Database(dbPath);

// If this is the first time we run, create tables and seed data
if (firstRun) {
  console.log('⏳ Seeding SQLite database…');

  // 1) Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      lastLoginAt TEXT
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      imgUrl TEXT NOT NULL,
      badLuckIdx REAL NOT NULL,
      category TEXT DEFAULT 'travel',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startedAt TEXT NOT NULL DEFAULT (datetime('now')),
      endedAt TEXT,
      status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'won', 'lost')),
      wrongCount INTEGER NOT NULL DEFAULT 0 CHECK (wrongCount >= 0 AND wrongCount <= 3),
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gameId INTEGER NOT NULL,
  cardId INTEGER NOT NULL,
  orderNo INTEGER NOT NULL, -- -1 表示初始手牌，0+ 表示游戏轮次
  guessedCorrect INTEGER NOT NULL CHECK (guessedCorrect IN (0, 1)),
  guessedAt TEXT NOT NULL DEFAULT (datetime('now')),
  position INTEGER, -- 玩家猜测的位置，-1表示超时
  FOREIGN KEY(gameId) REFERENCES games(id) ON DELETE CASCADE,
  FOREIGN KEY(cardId) REFERENCES cards(id),
  UNIQUE(gameId, cardId) -- 确保同一游戏中卡片不重复
);

    -- 创建索引提高查询性能
    CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(userId);
    CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
    CREATE INDEX IF NOT EXISTS idx_rounds_game_id ON rounds(gameId);
    CREATE INDEX IF NOT EXISTS idx_rounds_order_no ON rounds(gameId, orderNo);
    CREATE INDEX IF NOT EXISTS idx_cards_bad_luck_idx ON cards(badLuckIdx);
  `);

  // 2) Seed demo user with hashed password
  const hashedPassword = await bcrypt.hash('demo', 12);
  const ustmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  ustmt.run('demo', hashedPassword);

  // 3) Seed the 50 "Travel & Tourism" cards
  // Option A: Read from a separate SQL file (seed_cards.sql)
  // ----------------------------------------------------------------------------------
  // Make sure you have created a file at server/db/seed_cards.sql containing exactly the
  // 50 INSERT statements we showed previously. Then this block will execute them:
  // ----------------------------------------------------------------------------------
  try {
    const seedSqlPath = join(__dirname, 'seed_cards.sql');
    if (fs.existsSync(seedSqlPath)) {
      const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
      db.exec(seedSql);
      console.log('✅ Cards seeded from seed_cards.sql');
    } else {
      // 如果没有seed_cards.sql文件，创建一些示例卡片
      console.log('⚠️ seed_cards.sql not found, creating sample cards...');
      const sampleCards = [
        { title: 'missed-flight', imgUrl: '/images/1missed-flight.png', badLuckIdx: 15.2 },
        { title: 'lost-luggage', imgUrl: '/images/2lost-luggage.png', badLuckIdx: 25.8 },
        { title: 'passport-issue', imgUrl: '/images/3passport-issue.png', badLuckIdx: 45.6 },
        { title: 'hotel-full', imgUrl: '/images/4hotel-full.png', badLuckIdx: 32.4 },
        { title: 'severe-sunburn', imgUrl: '/images/5severe-sunburn.png', badLuckIdx: 14.0 },
        { title: 'flight-price-hike', imgUrl: '/images/6flight-price-hike.png', badLuckIdx: 19.0 },
        { title: 'wallet-stolen', imgUrl: '/images/7wallet-stolen.png', badLuckIdx: 40.0 },
        { title: 'cruise-stomach', imgUrl: '/images/8cruise-stomach.png', badLuckIdx: 48.0 },
        { title: 'snow-blindness', imgUrl: '/images/9snow-blindness.png', badLuckIdx: 28.0 },
        { title: 'lion-attack', imgUrl: '/images/10lion-attack.png', badLuckIdx: 80.0 },
        { title: 'fallinto-water', imgUrl: '/images/11fallinto-water.png', badLuckIdx: 28.0 },
        { title: 'jellyfish-sting', imgUrl: '/images/12jellyfish-sting.png', badLuckIdx: 29.5 },
        { title: 'scam-tour', imgUrl: '/images/13scam-tour.png', badLuckIdx: 35.2 },
        { title: 'food-poisoning', imgUrl: '/images/14food-poisoning.png', badLuckIdx: 42.1 },
        { title: 'taxi-trouble', imgUrl: '/images/15taxi-trouble.png', badLuckIdx: 22.7 }
      ];
      
      const cardStmt = db.prepare('INSERT INTO cards (title, imgUrl, badLuckIdx) VALUES (?, ?, ?)');
      sampleCards.forEach(card => {
        cardStmt.run(card.title, card.imgUrl, card.badLuckIdx);
      });
      console.log('✅ Sample cards created');
    }
  } catch (err) {
    console.error('❌ Failed to seed cards:', err);
  }
  
  console.log('✅ Database initialization complete');
}

// 导出一些有用的查询函数
export const queries = {
  // 获取用户的游戏统计
  getUserStats: db.prepare(`
    SELECT 
      COUNT(*) as totalGames,
      SUM(CASE WHEN status = 'won' THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN status = 'lost' THEN 1 ELSE 0 END) as losses,
      AVG(wrongCount) as avgWrongCount
    FROM games 
    WHERE userId = ?
  `),
  
  // 获取游戏的所有卡片
  getGameCards: db.prepare(`
    SELECT 
      r.orderNo,
      r.guessedCorrect,
      r.position,
      r.guessedAt,
      c.id,
      c.title,
      c.badLuckIdx,
      c.imgUrl
    FROM rounds r
    JOIN cards c ON r.cardId = c.id
    WHERE r.gameId = ?
    ORDER BY r.orderNo, c.badLuckIdx
  `),
  
  // 检查游戏是否属于用户
  checkGameOwnership: db.prepare(`
    SELECT id FROM games 
    WHERE id = ? AND userId = ?
  `),
  
  // 获取未使用的卡片
  getUnusedCards: db.prepare(`
    SELECT * FROM cards 
    WHERE id NOT IN (
      SELECT DISTINCT cardId FROM rounds WHERE gameId = ?
    )
    ORDER BY RANDOM()
  `),

  // 创建新用户（如果需要注册功能）
  createUser: db.prepare(`
    INSERT INTO users (username, password) VALUES (?, ?)
  `),

  // 根据用户名查找用户
  findUserByUsername: db.prepare(`
    SELECT * FROM users WHERE username = ?
  `),

  // 根据ID查找用户（不包括密码）
  findUserById: db.prepare(`
    SELECT id, username, createdAt, lastLoginAt FROM users WHERE id = ?
  `)
};