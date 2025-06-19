// File: server/routes/auth.js

import express from 'express';
import passport from '../auth/passport.js';
import bcrypt from 'bcrypt';
import { db, queries } from '../db/init.js';

const router = express.Router();

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Login failed' });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        console.error('Session error:', err);
        return res.status(500).json({ message: 'Session creation failed' });
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

// Logout route
router.post('/logout', (req, res) => {
  const username = req.user?.username;
  
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ message: 'Session destruction failed' });
      }
      
      res.clearCookie('connect.sid'); // Clear session cookie
      console.log(`✅ User ${username || 'unknown'} logged out successfully`);
      res.json({ success: true, message: 'Logged out successfully' });
    });
  });
});

// Get current user information
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  
  res.json({
    id: req.user.id,
    username: req.user.username,
    lastLoginAt: req.user.lastLoginAt
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? {
      id: req.user.id,
      username: req.user.username
    } : null
  });
});

// Register route (optional - decide whether to enable based on requirements)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password cannot be empty' });
    }
    
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ message: 'Username length must be between 3-20 characters' });
    }
    
    if (password.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }
    
    // Check if username already exists
    const existingUser = queries.findUserByUsername.get(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    
    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const result = queries.createUser.run(username, hashedPassword);
    const userId = result.lastInsertRowid;
    
    console.log(`✅ New user registered: ${username} (ID: ${userId})`);
    
    // Automatically log in the new user
    const newUser = queries.findUserById.get(userId);
    req.logIn(newUser, (err) => {
      if (err) {
        console.error('Auto-login error:', err);
        return res.status(201).json({ 
          message: 'Registration successful, please log in again',
          userId: userId
        });
      }
      
      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          username: newUser.username
        }
      });
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Registration failed, please try again later' });
  }
});

// Change password route
router.post('/change-password', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Not logged in' });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password cannot be empty' });
    }
    
    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'New password must be at least 4 characters long' });
    }
    
    // Get user's current password
   const user = db.prepare(`
  SELECT * FROM users 
  WHERE id = ?
`).get(req.user.id);

    // This line "const isValidPassword = await bcrypt.compare(password, user.password);" contains an error.
    // The variable 'password' is not defined in this scope. It should be 'currentPassword'.
    const isValidPassword = await bcrypt.compare(currentPassword, user.password); // Corrected line
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid current password' }); // Corrected message
    }
    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashedNewPassword, req.user.id);
    
    console.log(`✅ User ${req.user.username} changed password`);
    res.json({ message: 'Password changed successfully' });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;