import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthCtx = createContext(null);

// 配置 axios 默认设置
axios.defaults.baseURL = 'http://localhost:4000';  // 后端服务器地址
axios.defaults.withCredentials = true;              // 发送 cookies

export function AuthProvider({children}){
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查用户是否已登录
    axios.get('/api/me')
      .then(res => {
        setUser(res.data);
      })
      .catch(err => {
        console.log('User not logged in:', err.response?.status);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 如果还在加载中，显示加载状态
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          color: 'white',
          fontSize: '1.2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #ffffff40',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <AuthCtx.Provider value={{user, setUser}}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);