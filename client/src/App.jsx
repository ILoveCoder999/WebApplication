import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import DemoPage from './pages/DemoPage.jsx';
import Play from './pages/Play.jsx';
import Profile from './pages/Profile.jsx';
import GameRules from './pages/GameRules.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App(){
  const { user } = useAuth();
  
  return (
    <div className="app">
      <Routes>
        <Route path='/' element={<Login/>}/>
        <Route path='/rules' element={<GameRules/>}/>
        <Route path='/demo' element={<DemoPage/>}/>
        <Route path='/play' element={ user ? <Play/> : <Navigate to='/'/> }/>
        <Route path='/profile' element={ user ? <Profile/> : <Navigate to='/'/> }/>
      </Routes>
    </div>
  );
}