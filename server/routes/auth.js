// File: server/routes/auth.js

import express from 'express';
import passport from '../auth/passport.js';
import bcrypt from 'bcrypt';
import { db, queries } from '../db/init.js';

const router = express.Router();

// 登录路由
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: '服务器错误' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || '登录失败' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({ message: '会话创建失败' });
      }
      
      console.log(`✅ User ${user.username} logged in successfully`);
      res.json({
        id: user.id,
        username: user.username,
        lastLoginAt: user.lastLoginAt
      });
    });
  })(req, res, next);
});

// 注销路由
router.post('/logout', (req, res) => {
  const username = req.user?.username;
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: '注销失败' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: '会话销毁失败' });
      }
      
      res.clearCookie('connect.sid'); // 清除会话cookie
      console.log(`✅ User ${username || 'unknown'} logged out successfully`);
      res.json({ success: true, message: '注销成功' });
    });
  });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '未登录' });
  }
  
  res.json({
    id: req.user.id,
    username: req.user.username,
    lastLoginAt: req.user.lastLoginAt
  });
});

// 检查认证状态
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username
    } : null
  });
});

// 注册路由（可选 - 根据需求决定是否启用）
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: '用户名长度必须在3-20个字符之间' });
    }
    
    if (password.length < 4) {
      return res.status(400).json({ message: '密码长度至少4个字符' });
    }
    
    // 检查用户名是否已存在
    const existingUser = queries.findUserByUsername.get(username);
    if (existingUser) {
      return res.status(409).json({ message: '用户名已存在' });
    }
    
    // 哈希密码
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // 创建用户
    const result = queries.createUser.run(username, hashedPassword);
    const userId = result.lastInsertRowid;
    
    console.log(`✅ New user registered: ${username} (ID: ${userId})`);
    
    // 自动登录新用户
    const newUser = queries.findUserById.get(userId);
    req.logIn(newUser, (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(201).json({ 
          message: '注册成功，请重新登录',
          userId: userId
        });
      }
      
      res.status(201).json({
        message: '注册成功',
        user: {
          id: newUser.id,
          username: newUser.username
        }
      });
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: '用户名已存在' });
    }
    res.status(500).json({ message: '注册失败，请稍后重试' });
  }
});

// 更改密码路由
router.post('/change-password', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: '未登录' });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: '当前密码和新密码不能为空' });
    }
    
    if (newPassword.length < 4) {
      return res.status(400).json({ message: '新密码长度至少4个字符' });
    }
    
    // 获取用户当前密码
    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(req.user.id);
    
    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: '当前密码错误' });
    }
    
    // 哈希新密码
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // 更新密码
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, req.user.id);
    
    console.log(`✅ User ${req.user.username} changed password`);
    res.json({ message: '密码修改成功' });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '密码修改失败' });
  }
});

export default router;