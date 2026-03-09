import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { HiMoon, HiSun } from 'react-icons/hi';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="app-icon-btn focus:outline-none"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? <HiMoon size={20} /> : <HiSun size={20} />}
    </button>
  );
}
