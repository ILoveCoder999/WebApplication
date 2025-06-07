import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login(){
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const { setUser } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e){
    e.preventDefault();
    try{
      const res = await axios.post('/login', {username, password});
      setUser(res.data);
      navigate('/play');
    }catch(err){
      alert('login failed');
    }
  }

  return (
    <div className='p-4 max-w-sm mx-auto'>
      <h1 className='text-xl font-bold mb-4'>Stuff Happens Login</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
        <input className='border p-2' placeholder='username' value={username} onChange={e=>setUsername(e.target.value)}/>
        <input type='password' className='border p-2' placeholder='password' value={password} onChange={e=>setPassword(e.target.value)}/>
        <button className='bg-blue-600 text-white p-2 rounded'>Login</button>
      </form>
      
      <div className='mt-4 text-center space-y-2'>
        <Link to='/rules' className='block text-blue-600 hover:underline'>
          📖 游戏规则说明
        </Link>
        <Link to='/demo' className='block text-green-600 hover:underline'>
          🎮 试玩演示版本
        </Link>
      </div>
    </div>
  );
}