// File: client/src/components/TimerBar.jsx

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './TimerBar.css';

/**
 * TimerBar 组件：
 *   duration: 倒计时总时长，秒 (例如 30)
 *   onTimeUp: 时间耗尽时的回调 (超时算错)
 *   resetSignal: 一旦 resetSignal 改变，就重新启动倒计时
 */
export default function TimerBar({ duration, onTimeUp, resetSignal }) {
  const [percent, setPercent] = useState(100);
  const rafIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const onTimeUpRef = useRef(onTimeUp);
  const isRunningRef = useRef(false);

  // 更新回调引用，避免因为回调变化导致重启计时器
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // 优化：减少状态更新频率，只在百分比变化超过0.1%时更新
  const updatePercent = useCallback((newPercent) => {
    setPercent(prevPercent => {
      const rounded = Math.round(newPercent * 10) / 10; // 保留1位小数
      if (Math.abs(rounded - prevPercent) >= 0.1) {
        return rounded;
      }
      return prevPercent;
    });
  }, []);

  // 计时器主逻辑
  useEffect(() => {
    // 1. 取消上一次的动画帧
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    // 2. 重置状态
    setPercent(100);
    startTimeRef.current = performance.now();
    isRunningRef.current = true;

    // 3. 优化的tick函数
    const tick = (timestamp) => {
      if (!isRunningRef.current) return;

      const elapsed = (timestamp - startTimeRef.current) / 1000; // 秒
      const newPercent = Math.max(100 - (elapsed / duration) * 100, 0);
      
      updatePercent(newPercent);

      if (newPercent > 0) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        // 倒计时结束
        isRunningRef.current = false;
        onTimeUpRef.current();
      }
    };

    // 4. 启动计时器
    rafIdRef.current = requestAnimationFrame(tick);

    // 清理函数
    return () => {
      isRunningRef.current = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [duration, resetSignal, updatePercent]);

  // 根据剩余 percent 调整颜色：>30 → 绿色、>10 → 橙色、<=10 → 红色
  const barStyle = {
    width: `${percent}%`,
    backgroundColor: percent > 30 ? '#4caf50' : percent > 10 ? '#ff9800' : '#e53935',
  };

  return (
    <div className="timer-bar-container">
      <div className="timer-bar-fill" style={barStyle} />
    </div>
  );
}