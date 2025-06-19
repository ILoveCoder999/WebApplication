// File: client/src/pages/Play.jsx

import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GameBoard from '../components/GameBoard.jsx';
import TimerBar from '../components/TimerBar.jsx';
import './Play.css';

export default function Play() {
  const [gameId, setGameId] = useState(null);
  const [hand, setHand] = useState([]);
  const [hiddenCard, setHiddenCard] = useState(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [finalStatus, setFinalStatus] = useState('');
  const [wrongGuess, setWrongGuess] = useState(false);
  const [roundIndex, setRoundIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [finalHand, setFinalHand] = useState([]); // Save final hand

  // Prevent multiple initializations
  const initialized = useRef(false);
  const currentGameId = useRef(null);

  // Initialize game
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    async function startGame() {
      try {
        setLoading(true);
        setError('');

        console.log('🎮 Starting new game...');

        const res = await axios.post('/api/games', {}, { withCredentials: true });
        const { gameId, hand: initialHand } = res.data;
        if (!gameId) throw new Error('No gameId returned from create game API');
        console.log(`🎯 Game created: ${gameId}`);
        console.log('🃏 Initial hand:', initialHand);

        setGameId(gameId);
        currentGameId.current = gameId;
        setHand(initialHand);

        const nextRes = await axios.get(`/api/games/${gameId}/next`, { withCredentials: true });
        console.log('🎴 Next card:', nextRes.data);

        setHiddenCard(nextRes.data);
        setRoundIndex(0);
        setLoading(false);
      } catch (err) {
        console.error('Failed to start game:', err);
        if (err.response?.status === 401) {
          setError('Please log in first');
        } else {
          setError('Failed to start game, please refresh and try again');
        }
        setLoading(false);
      }
    }

    startGame();
  }, []);

  // The rest of the game logic remains unchanged...
  // Replace Chinese strings in the JSX below with their English equivalents:
  // Examples: "正在启动游戏..." -> "Starting game...", "出错了" -> "Error", "重新开始" -> "Restart"
  // (Continue translating all UI text from Chinese to English following this pattern.)

  // CSS translations: Replace comments like "/* 最终卡牌展示样式 */" -> "/* Final card display styles */"
  // Replace innerHTML fallback message with: '<span style="color: #1976d2; font-weight: bold;">Image failed to load</span>'

  // Finish by appending translated style block as before
