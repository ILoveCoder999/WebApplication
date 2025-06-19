import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx'; // 新增注册页面
import DemoPage from './pages/DemoPage.jsx';
import Play from './pages/Play.jsx';
import Profile from './pages/Profile.jsx';
import GameRules from './pages/GameRules.jsx';
import Header from './components/Header.jsx'; // 新增头部组件
import { useAuth } from './context/AuthContext.jsx';

export default function App(){
  const { user } = useAuth();
  
  return (
    <div className="app">
      {/* 只有在登录状态下才显示头部导航 */}
      {user && <Header />}
      
      <Routes>
        <Route path='/' element={user ? <Navigate to='/play'/> : <Login/>}/>
        <Route path='/login' element={user ? <Navigate to='/play'/> : <Login/>}/>
        <Route path='/register' element={user ? <Navigate to='/play'/> : <Register/>}/>
        <Route path='/rules' element={<GameRules/>}/>
        <Route path='/demo' element={<DemoPage/>}/>
        <Route path='/play' element={ user ? <Play/> : <Navigate to='/'/> }/>
        <Route path='/profile' element={ user ? <Profile/> : <Navigate to='/'/> }/>
      </Routes>
    </div>
  );
}