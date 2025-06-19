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
    // 清除之前的错误信息
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    const { username, password, confirmPassword } = formData;
    
    if (!username || !password || !confirmPassword) {
      setError('所有字段都是必填的');
      return false;
    }
    
    if (username.length < 3 || username.length > 20) {
      setError('用户名长度必须在3-20个字符之间');
      return false;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('用户名只能包含字母、数字和下划线');
      return false;
    }
    
    if (password.length < 4) {
      setError('密码长度至少4个字符');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
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
      
      // 注册成功，自动登录
      setUser(res.data.user);
      setSuccess('注册成功！正在跳转...');
      
      setTimeout(() => {
        navigate('/play');
      }, 1000);
      
    } catch (err) {
      if (err.response?.status === 409) {
        setError('用户名已存在，请选择其他用户名');
      } else if (err.response?.status === 400) {
        setError(err.response.data.message || '注册信息有误');
      } else if (err.response?.status === 404) {
        setError('服务器连接失败，请检查后端是否启动');
      } else {
        setError('注册失败，请稍后重试');
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
          🎮 注册新账户
        </h1>
        
        {/* 注册说明 */}
        <div style={{
          background: 'linear-gradient(45deg, #e8f5e8, #c8e6c9)',
          padding: '1rem',
          borderRadius: '10px',
          marginBottom: '1.5rem',
          textAlign: 'center',
          border: '1px solid #4caf50'
        }}>
          <p style={{ margin: 0, color: '#2e7d32', fontWeight: 'bold' }}>
            创建账户享受完整游戏体验
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#2e7d32', fontSize: '0.9rem' }}>
            • 保存游戏进度和统计<br/>
            • 查看历史记录<br/>
            • 个性化游戏体验
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
            placeholder='用户名 (3-20个字符)' 
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
            placeholder='密码 (至少4个字符)' 
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
            placeholder='确认密码' 
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
            {loading ? '🔄 注册中...' : '🎮 创建账户'}
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
            已有账户？
            <Link 
              to='/login' 
              style={{
                color: '#3498db',
                textDecoration: 'none',
                fontWeight: '600',
                marginLeft: '0.5rem'
              }}
            >
              立即登录
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
            📖 游戏规则
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
            🎮 试玩演示
          </Link>
        </div>
      </div>
    </div>
  );
}