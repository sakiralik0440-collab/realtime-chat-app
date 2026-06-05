import { createContext, useState, useContext, useEffect } from "react";
import api from '../utils/api';

const AuthContext = createContext();


export const AuthProvider =  ({ children }) => {
    const [user , setUser] = useState(null);
    const [token , setToken] = useState(localStorage.getItem('token'));
    const [loading , setLoading] = useState(true);


    useEffect(() => {
        if (token) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        }
        setLoading(false);
    }, [token]);

    //Register
    const register = async (username, email, password, phone) => {
  const res = await api.post('/auth/register', { username, email, password, phone });
  const { token, user } = res.data;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  setToken(token);
  setUser(user);
  return res.data;
};

    //Login
    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        const { token, user } = res.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return res.data;
    };

    //logout
    const logout = () =>{
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value ={{ user, token, loading, register, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;