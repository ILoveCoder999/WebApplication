// File: server/server.js

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入 Passport 配置
import passport from './auth/passport.js';

// 导入路由
import authRoutes from './routes/auth.js';
import gamesRoutes from './routes/games.js';
import userRoutes from './routes/user.js';

// 导入数据库初始化
import './db/init.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// 中间件配置
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5173'], // 支持 Vite 和 CRA
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 会话配置
app.use(session({
  secret: process.env.SESSION_SECRET || 'stuff-happens-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// 初始化 Passport
app.use(passport.initialize());
app.use(passport.session());

// 静态文件服务 - 服务前端构建文件
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// 中间件：记录认证状态
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    console.log(`${req.method} ${req.path} - Auth: ${req.isAuthenticated()} - User: ${req.user?.username || 'none'}`);
  }
  next();
});

// API 路由
app.use('/api', authRoutes);
app.use('/api', gamesRoutes);
app.use('/api/user', userRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    authenticated: req.isAuthenticated(),
    user: req.user?.username || null
  });
});

// 生产环境下，所有非API请求都返回React应用
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🎮 Stuff Happens Game Server`);
  console.log(`🔐 Authentication: Passport.js + bcrypt`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔗 Local: http://localhost:${PORT}`);
    console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
    console.log(`👤 Demo User: username=demo, password=demo`);
  }
});

// 优雅关闭
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

export default app;