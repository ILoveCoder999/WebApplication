import express from 'express';
import { db } from '../db/init.js';

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if(!user){
    return res.status(401).json({message:'Invalid credentials'});
  }
  req.session.userId = user.id;
  res.json({id:user.id, username:user.username});
});

router.post('/logout', (req,res)=>{
  req.session.destroy(()=> res.json({ok:true}));
});

router.get('/me', (req,res)=>{
  if(!req.session.userId){
    return res.status(401).json(null);
  }
  const user = db.prepare('SELECT id, username FROM users WHERE id=?').get(req.session.userId);
  res.json(user);
});

export default router;
