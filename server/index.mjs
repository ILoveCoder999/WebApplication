import express from 'express';
import session from 'express-session';
import cors from 'cors';

import './db/init.js';            // ensure DB exists
import authRouter from './routes/auth.js';
import gamesRouter from './routes/games.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'stuff-happens-secret',
  resave: false,
  saveUninitialized: false
}));

app.use('/api', authRouter);
app.use('/api', gamesRouter);

app.get('/', (_, res) => res.json({msg:'Stuff Happens API'}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 API listening on http://localhost:${PORT}`));
