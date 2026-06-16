import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setMemoryToken } from '../services/api';

export interface UserType {
  id: string;
  name: string;
  email: string;
  points: number;
  streak: number;
  badges: string[];
}

export type ThemeType = 'light' | 'dark' | 'high-contrast';

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  isGuest: boolean;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [theme, setThemeState] = useState<ThemeType>('light');

  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem('ecotrack_theme', newTheme);
    
    // Apply class to document body/html
    const root = document.documentElement;
    root.classList.remove('dark', 'high-contrast');
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'high-contrast') {
      root.classList.add('high-contrast');
    }
  };

  useEffect(() => {
    // Load local storage items
    const savedTheme = localStorage.getItem('ecotrack_theme') as ThemeType;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const token = localStorage.getItem('ecotrack_token');
    if (token) {
      refreshUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const refreshUser = async () => {
    try {
      const data = await api.get<UserType>('/auth/profile');
      setUser(data);
    } catch (err) {
      console.error('Failed to retrieve user session:', err);
      logout();
    }
  };

  const login = async (email: string, password: string) => {
    const data = await api.post<{ token: string; user: UserType }>('/auth/login', { email, password });
    localStorage.setItem('ecotrack_token', data.token);
    setIsGuest(false);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api.post<{ token: string; user: UserType }>('/auth/register', { name, email, password });
    localStorage.setItem('ecotrack_token', data.token);
    setIsGuest(false);
    setUser(data.user);
  };

  const loginAsGuest = async () => {
    // Generate a random guest identity
    const guestId = Math.random().toString(36).substring(2, 8);
    const guestName = `Eco Explorer ${guestId}`;
    const guestEmail = `guest_${guestId}@ecotrack-demo.local`;
    const guestPassword = `demo_${guestId}_${Date.now()}`;

    // Register guest on backend, but store token ONLY in memory (not localStorage)
    const data = await api.post<{ token: string; user: UserType }>('/auth/register', {
      name: guestName,
      email: guestEmail,
      password: guestPassword
    });

    // Store token in memory only — lost on refresh/close
    setMemoryToken(data.token);
    setIsGuest(true);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('ecotrack_token');
    setMemoryToken(null);
    setIsGuest(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, theme, setTheme, login, register, loginAsGuest, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
