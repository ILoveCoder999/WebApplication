// File: server/db/init.js

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
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
      username TEXT UNIQUE,
      password TEXT
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      imgUrl TEXT NOT NULL,
      badLuckIdx REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT,
      status TEXT NOT NULL DEFAULT 'ongoing',
      wrongCount INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gameId INTEGER NOT NULL,
      cardId INTEGER NOT NULL,
      orderNo INTEGER NOT NULL,
      guessedCorrect INTEGER NOT NULL,
      FOREIGN KEY(gameId) REFERENCES games(id),
      FOREIGN KEY(cardId) REFERENCES cards(id)
    );
  `);

  // 2) Seed one demo user
  const ustmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  ustmt.run('demo', 'demo');

  // 3) Seed the 50 “Travel & Tourism” cards
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
    } else {
      throw new Error('seed_cards.sql not found');
    }
  } catch (err) {
    console.error('Failed to read seed_cards.sql:', err)
  }
  console.log(' Seed done');
}
