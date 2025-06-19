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
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🌍 Game Background</h2>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          Welcome to "Stuff Happens" - a card game about all sorts of unlucky events during global travel!
        </p>
        <p style={{ lineHeight: '1.6', marginBottom: '1rem' }}>
          In this game, you'll face unfortunate situations that might occur during a trip, from minor inconveniences (like missing a flight) to serious hazards (like a shark attack). Each event has a "Bad Luck Index" representing how severe it is.
        </p>
        <p style={{ lineHeight: '1.6' }}>
          Your task is to arrange these events in the correct order based on their severity.
        </p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎯 Objective</h2>
        <p>Sort randomly appearing "bad luck" cards in ascending order by their Bad Luck Index.</p>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>📝 Game Rules</h2>
        <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
          <li>You start with 3 pre-sorted cards</li>
          <li>Each round, a new mystery card appears</li>
          <li>You must drag it into the correct position within 30 seconds</li>
          <li><strong>Important: Higher number = More unlucky = Later position</strong></li>
          <li>Game ends after 3 wrong guesses!</li>
          <li>Win by collecting 6 cards successfully</li>
        </ol>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎲 About Bad Luck Index</h2>
        <div style={{
          background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
          padding: '1.5rem',
          borderRadius: '10px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e65100', marginBottom: '1rem' }}>
            ⚠️ Higher number = More unlucky = Later in order
          </p>
          <p style={{ color: '#bf360c' }}>
            Bad Luck Index ranges from 0 to 100, the higher the number the worse the event
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
            <div style={{ fontSize: '0.9rem', color: '#388e3c' }}>Minor inconvenience</div>
            <div style={{ fontSize: '0.8rem', color: '#4caf50', marginTop: '0.5rem' }}>
              Missed flight, delayed luggage
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
            <div style={{ fontSize: '0.9rem', color: '#ef6c00' }}>Moderate trouble</div>
            <div style={{ fontSize: '0.8rem', color: '#ff9800', marginTop: '0.5rem' }}>
              Passport issues, full hotel
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
            <div style={{ fontSize: '0.9rem', color: '#c62828' }}>Severe danger</div>
            <div style={{ fontSize: '0.8rem', color: '#f44336', marginTop: '0.5rem' }}>
              Avalanche, shark attack
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>⏰ Time Pressure</h2>
        <p style={{ marginBottom: '1rem' }}>You have 30 seconds each round to decide. The countdown bar changes color to alert you:</p>
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
            Green: Ample time (30-10s)
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#ff9800',
              marginRight: '1rem'
            }}></div>
            Orange: Hurry up (10-3s)
          </li>
          <li style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: '#e53935',
              marginRight: '1rem'
            }}></div>
            Red: Almost out of time (3-0s)
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#555', marginBottom: '1rem' }}>🎈 Example</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <p style={{ marginBottom: '1rem' }}><strong>Suppose your current hand:</strong></p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#e8f5e8', padding: '0.5rem', borderRadius: '5px' }}>Missed Flight (15)</span>
            <span style={{ background: '#fff3e0', padding: '0.5rem', borderRadius: '5px' }}>Lost Luggage (25)</span>
            <span style={{ background: '#ffebee', padding: '0.5rem', borderRadius: '5px' }}>Passport Issue (45)</span>
          </div>
          <p style={{ marginBottom: '1rem' }}><strong>New Card:</strong> "Hotel Fully Booked (32)"</p>
          <p style={{ color: '#28a745', fontWeight: 'bold' }}>
            ✅ Correct answer: insert at position 3 (between 25 and 45)
          </p>
          <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
            Because 25 &lt; 32 &lt; 45, so "Hotel Fully Booked" goes between "Lost Luggage" and "Passport Issue"
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
            transition: 'transform 0.2s',
            fontSize: '1.1rem'
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
