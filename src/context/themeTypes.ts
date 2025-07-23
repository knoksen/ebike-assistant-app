// Theme definitions
export type Theme = 'default' | 'midnight' | 'forest' | 'ocean';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

export function getThemeClasses(theme: Theme, isDark: boolean): string {
  const baseClasses = 'transition-all duration-500';
  
  if (theme === 'midnight') {
    return `${baseClasses} theme-midnight text-slate-100`;
  } else if (theme === 'forest') {
    return `${baseClasses} theme-forest text-green-50`;
  } else if (theme === 'ocean') {
    return `${baseClasses} theme-ocean text-blue-50`;
  }
  
  return `${baseClasses} ${isDark ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`;
}
