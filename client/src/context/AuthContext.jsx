import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

export const AuthCtx = createContext(null);

axios.defaults.baseURL = 'http://localhost:4000/api';
axios.defaults.withCredentials = true;

export function AuthProvider({children}){
  const [user,setUser] = useState(null);
  useEffect(()=>{
    axios.get('/me')
      .then(res=>setUser(res.data))
      .catch(()=>setUser(null));
  },[]);
  return <AuthCtx.Provider value={{user,setUser}}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx);
