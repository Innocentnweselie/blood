import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import { useAuth } from './AuthContext.jsx';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore
    }
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme); // Optimistic UI update

    try {
      if (isAuthenticated) {
        await api.put('/settings/theme', { theme: newTheme });
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error);
      // Don't revert UI on error, just log it. The user still wants dark mode locally.
    }
  };

  // Function to set theme from an external source, like after login
  const applyTheme = (newTheme) => {
    if (newTheme && ['light', 'dark'].includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
