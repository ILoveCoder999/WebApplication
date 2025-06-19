import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear previous error messages
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const { username, password, confirmPassword } = formData;
    
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      setError('Username length must be between 3-20 characters');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return false;
    }
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await axios.post('/api/register', {
        username: formData.username,
        password: formData.password
      });
      
      // Registration successful, automatically log in
      setUser(res.data.user);
      setSuccess('Registration successful! Redirecting...');
      
      setTimeout(() => {
        navigate('/play');
      }, 1000);
      
    } catch (err) {
      if (err.response?.status === 409) {
        setError('Username already exists, please choose another username');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || 'Invalid registration information');
      } else if (err.response?.status === 404) {
        setError('Server connection failed, please check if the backend is running');
      } else {
        setError('Registration failed, please try again later');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

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
          🎮 Register New Account
        </h1>
        
        {/* Registration Instructions */}
        <div style={{
          background: 'linear-gradient(45deg, #e8f5e8, #c8e6c9)',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          border: '1px solid #4caf50'
        }}>
          <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
            Create an account to enjoy the full game experience
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#2e7d32', fontSize: '0.9rem' }}>
            • Save game progress and stats<br/>
            • View history<br/>
            • Personalize your game experience
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <input 
            type="text"
            name="username"
            style={{
              padding: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
            placeholder='Username (3-20 characters)' 
            value={formData.username} 
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="username"
          />
          
          <input 
            type='password' 
            name="password"
            style={{
              padding: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
            placeholder='Password (at least 4 characters)' 
            value={formData.password} 
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
          />
          
          <input 
            type='password' 
            name="confirmPassword"
            style={{
              padding: '1rem',
              border: '2px solid #e1e5e9',
              borderRadius: '10px',
              fontSize: '1rem',
              background: 'rgba(255, 255, 255, 0.9)'
            }}
            placeholder='Confirm Password' 
            value={formData.confirmPassword} 
            onChange={handleChange}
            required
            disabled={loading}
            autoComplete="new-password"
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
          
          {success && (
            <div style={{
              color: '#27ae60', 
              textAlign: 'center', 
              fontSize: '0.9rem',
              background: '#e8f5e8',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #c8e6c9'
            }}>
              {success}
            </div>
          )}
          
          <button 
            style={{
              background: loading ? '#bdc3c7' : 'linear-gradient(45deg, #27ae60, #2ecc71)',
              color: 'white',
              padding: '1rem',
              borderRadius: '10px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            type='submit'
            disabled={loading}
          >
            {loading ? '🔄 Registering...' : '🎮 Create Account'}
          </button>
        </form>
        
        <div style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            color: '#7f8c8d',
            fontSize: '0.9rem'
          }}>
            Already have an account?
            <Link 
              to='/login' 
              style={{
                color: '#3498db',
                textDecoration: 'none',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              Log In
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
            🎮 Play Demo
          </Link>
        </div>
      </div>
    </div>
  );
}