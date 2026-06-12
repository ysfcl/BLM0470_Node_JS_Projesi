import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setToken, login as apiLogin, register as apiRegister } from './ApiService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const register = async (name, email, password) => {
    try {
      const response = await apiRegister(name, email, password);

      if (!response.token) {
        throw new Error('Token received from backend is empty');
      }

      const token = response.token;
      const userData = response.user || { name, email, role: 'user' };

      setToken(token);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.log('Register error:', e.message);
      throw e;
    }
  };

  const login = async (email, password) => {
    try {
      // Backend'den token al
      const response = await apiLogin(email, password);

      if (!response.token) {
        throw new Error('Token received from backend is empty');
      }

      const token = response.token;
      const userData = response.user || { name: email.split('@')[0], email, role: 'user' };

      setToken(token);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (e) {
      console.log('Login error:', e.message);
      throw e;
    }
  };

  const logout = async () => {
    setToken(null);
    await AsyncStorage.multiRemove(['token', 'user']);
    setUser(null);
  };

  const restoreSession = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const raw = await AsyncStorage.getItem('user');
      if (token && raw) {
        setToken(token);
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.log('Session restore error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);