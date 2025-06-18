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
        🎮 Stuff Happens - Game Rules
      </h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎯 Game Objective</h2>
        <p>Arrange random "unfortunate event" cards in order from lowest to highest Bad Luck Index.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>📝 How to Play</h2>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>Start with 3 pre-sorted cards</li>
          <li>Each round, a new mystery card appears</li>
          <li>Drag the card to the correct position within 30 seconds</li>
          <li>Cards are ordered by Bad Luck Index (lower = less unlucky = goes first)</li>
          <li>3 mistakes and you're out!</li>
        </ol>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎲 Bad Luck Index</h2>
        <p><strong>Lower numbers = Less unlucky = Goes first</strong></p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <div style={{ 
            padding: '1rem', 
            background: '#e8f5e8', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>15.2</div>
            <div style={{ fontSize: '0.9rem' }}>Minor inconvenience</div>
          </div>
          <div style={{ 
            padding: '1rem', 
            background: '#fff3e0', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#f57c00' }}>45.6</div>
            <div style={{ fontSize: '0.9rem' }}>Moderate annoyance</div>
          </div>
          <div style={{ 
            padding: '1rem', 
            background: '#ffebee', 
            borderRadius: '8px',
            textAlign: 'center',
            minWidth: '100px'
          }}>
            <div style={{ fontWeight: 'bold', color: '#d32f2f' }}>85.3</div>
            <div style={{ fontSize: '0.9rem' }}>Major misfortune</div>
          </div>
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
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🎮 Try Demo
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
            transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          🔑 Start Game
        </Link>
      </div>
    </div>
  );
}