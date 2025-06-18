// File: server/index.mjs

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { db } from './db/init.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/games.js';

const app = express();
const PORT = process.env.PORT || 4000;

// 中间件配置
app.use(cors({
  origin: 'http://localhost:5173',  // 前端地址
  credentials: true                 // 允许发送 cookies
}));

app.use(express.json());

// Session 配置
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,    // 开发环境设为 false，生产环境设为 true
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000  // 24小时
  }
}));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 路由配置
app.use('/api', authRoutes);
app.use('/api', gameRoutes);

// 用户游戏历史接口（修复路由）
app.get('/api/user/games', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'login required' });
  }
  
  try {
    const games = db.prepare(`
      SELECT 
        id,
        DATE(startedAt) as date,
        status,
        wrongCount,
        CASE 
          WHEN endedAt IS NOT NULL 
          THEN ROUND((julianday(endedAt) - julianday(startedAt)) * 24 * 60, 1) || ' min'
          ELSE 'ongoing'
        END as duration,
        CASE 
          WHEN status = 'won' THEN 15 - wrongCount * 3
          ELSE wrongCount * 2
        END as score
      FROM games 
      WHERE userId = ? 
      ORDER BY startedAt DESC 
      LIMIT 10
    `).all(req.session.userId);
    
    res.json(games);
  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 测试路由
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    session: req.session.userId ? 'authenticated' : 'not authenticated'
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({ 
    message: 'Stuff Happens Server', 
    endpoints: [
      'POST /api/login',
      'POST /api/logout', 
      'GET /api/me',
      'POST /api/games',
      'GET /api/games/:id/next',
      'POST /api/games/:id/guess',
      'GET /api/user/games'
    ]
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404处理
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `API endpoint not found: ${req.method} ${req.originalUrl}` });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Database initialized`);
  console.log(`🎮 Demo user: username=demo, password=demo`);
  
  // 检查数据库中的用户
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    console.log(`👥 Users in database: ${userCount.count}`);
    
    const cardCount = db.prepare('SELECT COUNT(*) as count FROM cards').get();
    console.log(`🃏 Cards in database: ${cardCount.count}`);
  } catch (error) {
    console.error('Database check failed:', error);
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close();
  process.exit(0);
});