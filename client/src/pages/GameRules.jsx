import React from 'react';
import { Link } from 'react-router-dom';

export default function GameRules() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      padding: '2rem',
      background: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#333', 
        marginBottom: '2rem',
        fontSize: '2.5rem'
      }}>
        🎮 Stuff Happens - 游戏规则
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🌍 游戏背景</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          欢迎来到 "Stuff Happens" - 一个关于世界旅行中各种倒霉事件的卡牌游戏！
        </p>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          在这个游戏中，您将面对各种可能在旅行途中遇到的倒霉情况：从小小的不便（如错过航班）
          到严重的危险事件（如鲨鱼袭击）。每个事件都有一个"坏运指数"，反映其严重程度。
        </p>
        <p style={{ lineHeight: '1.6' }}>
          您的任务是根据这些倒霉事件的严重程度，将它们按正确顺序排列。
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎯 游戏目标</h2>
        <p>将随机出现的"倒霉事件"卡片按坏运指数从低到高的顺序排列。</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>📝 游戏规则</h2>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>游戏开始时，您有3张已按顺序排列的初始卡片</li>
          <li>每一轮，会出现一张新的神秘卡片</li>
          <li>您需要在30秒内将卡片拖拽到正确位置</li>
          <li><strong>重要：数字越大 = 越倒霉 = 排在后面</strong></li>
          <li>答错3次游戏结束！</li>
          <li>成功收集6张卡片即可获胜</li>
        </ol>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎲 坏运指数说明</h2>
        <div style={{
          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e65100', marginBottom: '1rem' }}>
            ⚠️ 数字越大 = 越倒霉 = 排在后面
          </p>
          <p style={{ color: '#bf360c' }}>
            坏运指数从0到100，数值越高代表越严重的倒霉事件
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #e8f5e8, #c8e6c9)', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '140px',
            border: '2px solid #4caf50'
          }}>
            <div style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '1.2rem' }}>0-30</div>
            <div style={{ fontSize: '0.9rem', color: '#388e3c' }}>轻微不便</div>
            <div style={{ fontSize: '0.8rem', color: '#4caf50', marginTop: '0.5rem' }}>
              错过航班、行李延误
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #fff3e0, #ffcc02)', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '140px',
            border: '2px solid #ff9800'
          }}>
            <div style={{ fontWeight: 'bold', color: '#f57c00', fontSize: '1.2rem' }}>31-60</div>
            <div style={{ fontSize: '0.9rem', color: '#ef6c00' }}>中等麻烦</div>
            <div style={{ fontSize: '0.8rem', color: '#ff9800', marginTop: '0.5rem' }}>
              护照问题、酒店客满
            </div>
          </div>
          <div style={{ 
            padding: '1rem', 
            background: 'linear-gradient(135deg, #ffebee, #ffcdd2)', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '140px',
            border: '2px solid #f44336'
          }}>
            <div style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.2rem' }}>61-100</div>
            <div style={{ fontSize: '0.9rem', color: '#c62828' }}>严重危险</div>
            <div style={{ fontSize: '0.8rem', color: '#f44336', marginTop: '0.5rem' }}>
              雪崩、鲨鱼袭击
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>⏰ 时间压力</h2>
        <p style={{ marginBottom: '1rem' }}>每轮您有30秒时间做决定。倒计时条会变色提醒您：</p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0, 
          marginTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#4caf50',
              marginRight: '1rem'
            }}></div>
            绿色：时间充足（30-10秒）
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ff9800',
              marginRight: '1rem'
            }}></div>
            橙色：时间紧张（10-3秒）
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#e53935',
              marginRight: '1rem'
            }}></div>
            红色：即将超时（3-0秒）
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎈 游戏示例</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ marginBottom: '1rem' }}><strong>假设您当前手牌：</strong></p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#e8f5e8', padding: '0.5rem', borderRadius: '5px' }}>错过航班 (15)</span>
            <span style={{ background: '#fff3e0', padding: '0.5rem', borderRadius: '5px' }}>行李丢失 (25)</span>
            <span style={{ background: '#ffebee', padding: '0.5rem', borderRadius: '5px' }}>护照问题 (45)</span>
          </div>
          <p style={{ marginBottom: '1rem' }}><strong>新卡片：</strong> "酒店客满 (32)"</p>
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ 正确答案：插入到位置3（在25和45之间）
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
            因为 25 &lt; 32 &lt; 45，所以"酒店客满"应该排在"行李丢失"和"护照问题"之间
          </p>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1rem', 
        marginTop: '3rem',
        flexWrap: 'wrap'
      }}>
        <Link 
          to="/demo" 
          style={{ 
            background: 'linear-gradient(45deg, #4caf50, #8bc34a)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
            transition: 'transform 0.2s',
            fontSize: '1.1rem'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🎮 体验演示
        </Link>
        <Link 
          to="/" 
          style={{ 
            background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '25px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block',
            transition: 'transform 0.2s',
            fontSize: '1.1rem'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔑 开始游戏
        </Link>
      </div>
    </div>
  );
}