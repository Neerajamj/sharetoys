import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api';

const STORAGE_KEY = 'sharetoys_auth';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      }
      setReady(true);
    });
  }, []);

  async function persist(userData, tokenValue) {
    setUser(userData);
    setToken(tokenValue);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ user: userData, token: tokenValue }));
  }

  async function login(email, password) {
    const data = await api.login({ email, password });
    await persist({ id: data.id, name: data.name, email: data.email }, data.token);
  }

  async function register(name, email, password) {
    const data = await api.register({ name, email, password });
    await persist({ id: data.id, name: data.name, email: data.email }, data.token);
  }

  async function logout() {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, token, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
