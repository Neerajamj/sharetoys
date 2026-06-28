import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('sharetoys_auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed.user);
      setToken(parsed.token);
    }
  }, []);

  function persist(userData, tokenValue) {
    setUser(userData);
    setToken(tokenValue);
    localStorage.setItem('sharetoys_auth', JSON.stringify({ user: userData, token: tokenValue }));
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    persist({ id: data.id, name: data.name, email: data.email }, data.token);
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    persist({ id: data.id, name: data.name, email: data.email }, data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sharetoys_auth');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
