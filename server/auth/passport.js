// File: server/auth/passport.js

import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { db } from '../db/init.js';

// Configure the local strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  async (username, password, done) => {
    try {
      // Find the user
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      // Validate the password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return done(null, false, { message: 'Incorrect username or password' });
      }

      // Update last login time - Fix: use single quotes
      db.prepare("UPDATE users SET lastLoginAt = datetime('now') WHERE id = ?").run(user.id);

      // Return user information (excluding password)
      const { password: _, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user to the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((id, done) => {
  try {
    const user = db.prepare('SELECT id, username, createdAt, lastLoginAt FROM users WHERE id = ?').get(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;