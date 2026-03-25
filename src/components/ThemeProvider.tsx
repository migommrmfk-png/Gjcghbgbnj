import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'emerald-light' | 'emerald-dark' | 'gold-light' | 'gold-dark' | 'blue-light' | 'blue-dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    if (!saved || saved === 'default' || saved === 'dark' || saved === 'blue' || saved === 'brown' || saved === 'classic-green' || saved === 'black-gold' || saved === 'calm-blue' || saved === 'purple-gold' || saved === 'natural' || saved === 'islamic-dark') {
      return 'emerald-light'; // Migrate old themes to the new default
    }
    return (saved as Theme) || 'emerald-light';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
