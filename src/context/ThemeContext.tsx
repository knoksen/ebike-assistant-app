import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from './themeTypes';
import { getThemeClasses } from './themeTypes';
import { ThemeContext } from './useTheme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ebike-theme') as Theme;
    return saved || 'default';
  });
  
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ebike-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('ebike-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('ebike-dark-mode', JSON.stringify(isDark));
  }, [isDark]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.remove('theme-midnight', 'theme-forest', 'theme-ocean', 'dark');
    
    if (theme !== 'default') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
    
    if (isDark) {
      document.documentElement.classList.add('dark');
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
      <div className={`min-h-screen transition-all duration-500 ${getThemeClasses(theme, isDark)}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
