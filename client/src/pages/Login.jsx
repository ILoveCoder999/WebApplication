import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    setLoading(true);
    setError('');

    try{
      const res = await axios.post('/api/login', {username, password});
      setUser(res.data);
      navigate('/play');
    }catch(err){
      if (err.response?.status === 404) {
        setError('Server connection failed. Is the backend running?');
      } else if (err.response?.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed. Please try again later.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '3rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '2rem',
          color: '#2c3e50'
        }}>
          🎮 Stuff Happens
        </h1>

        {/* Demo account notice */}
        <div style={{
          background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          border: '1px solid #2196f3'
        }}>
          <p style={{ margin: 0, color: '#1976d2', fontWeight: 'bold' }}>
            Demo Account
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#1976d2' }}>
            Username: <strong>demo</strong><br/>
            Password: <strong>demo</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <input 
            style={{
              padding: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
            placeholder='Username' 
            value={username} 
            onChange={e => setUsername(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />
          <input 
            type='password' 
            style={{
              padding: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
            placeholder='Password' 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />

          {error && (
            <div style={{
              color: '#e74c3c', 
              textAlign: 'center', 
              fontSize: '0.9rem',
              background: '#ffebee',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #ffcdd2'
            }}>
              {error}
            </div>
          )}

          <button 
            style={{
              background: 'linear-gradient(45deg, #3498db, #2980b9)',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              border: 'none'
            }}
            type='submit'
            disabled={loading}
          >
            {loading ? '🔄 Logging in...' : '🔑 Log In'}
          </button>
        </form>

        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Sign up prompt */}
          <div style={{
            color: '#7f8c8d',
            fontSize: '0.9rem',
            marginBottom: '0.5rem'
          }}>
            Don't have an account?
            <Link 
              to='/register' 
              style={{
                color: '#27ae60',
                textDecoration: 'none',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              Sign Up
            </Link>
          </div>

          <Link 
            to='/rules' 
            style={{
              color: '#3498db',
              padding: '0.75rem 1rem',
              border: '2px solid #3498db',
              borderRadius: '25px',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#3498db';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#3498db';
            }}
          >
            📖 Game Rules
          </Link>
          <Link 
            to='/demo' 
            style={{
              color: '#27ae60',
              padding: '0.75rem 1rem',
              border: '2px solid #27ae60',
              borderRadius: '25px',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#27ae60';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#27ae60';
            }}
          >
            🎮 Try Demo
          </Link>
        </div>
      </div>
    </div>
  );
}
