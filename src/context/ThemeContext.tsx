/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createContext } from 'react';
import type { Theme, ThemeContextType } from './ThemeContextType';
import { getThemeClasses } from './ThemeContextType';

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialState?: {
    theme?: Theme;
    isDark?: boolean;
  };
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialState }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (initialState?.theme) return initialState.theme;
    try {
      const saved = localStorage.getItem('ebike-theme') as Theme;
      return saved && ['default', 'midnight', 'forest', 'ocean'].includes(saved) ? saved : 'default';
    } catch {
      return 'default';
    }
  });
  
  const [isDark, setIsDark] = useState(() => {
    if (typeof initialState?.isDark === 'boolean') return initialState.isDark;
    try {
      const saved = localStorage.getItem('ebike-dark-mode');
      return saved ? JSON.parse(saved) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ebike-theme', theme);
    } catch (e) {
      // swallow to avoid crashing tests when storage is mocked to throw
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem('ebike-dark-mode', JSON.stringify(isDark));
    } catch (e) {
      // swallow
    }
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;
    // Apply theme to document
    root.classList.remove('theme-midnight', 'theme-forest', 'theme-ocean', 'dark');
    
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
    
    if (isDark) {
      root.classList.add('dark');
      root.style.backgroundColor = '#111827'; // dark:bg-gray-900
      root.style.color = '#ffffff'; // dark:text-white
    } else {
      root.style.backgroundColor = '#f9fafb'; // bg-gray-50
      root.style.color = '#111827'; // text-gray-900
    }
  }, [theme, isDark]);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  const value = {
    theme,
    setTheme,
    isDark,
    toggleDarkMode,
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen w-full transition-all duration-500 ${getThemeClasses(theme, isDark)}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
