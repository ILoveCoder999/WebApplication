// File: server/auth/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from '../db/init.js';

// 配置本地策略
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      // 查找用户
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      
      if (!user) {
        return done(null, false, { message: '用户名或密码错误' });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: '用户名或密码错误' });
      }

      // 更新最后登录时间 - 修复：使用单引号
      db.prepare("UPDATE users SET lastLoginAt = datetime('now') WHERE id = ?").run(user.id);

      // 返回用户信息（不包括密码）
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// 序列化用户到会话
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// 从会话反序列化用户
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT id, username, createdAt, lastLoginAt FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;