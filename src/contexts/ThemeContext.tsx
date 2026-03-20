import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ThemeColor {
  name: string;
  primary: string;
  light: string;
}

export const KAWAII_COLORS: ThemeColor[] = [
  { name: 'Neutral', primary: '#71717a', light: '#a1a1aa' },
  { name: 'Sakura', primary: '#ff85a1', light: '#fbb1bd' },
  { name: 'Lavender', primary: '#c19ee0', light: '#d8b4fe' },
  { name: 'Mint', primary: '#96e6b3', light: '#bbf7d0' },
  { name: 'Sky', primary: '#a2d2ff', light: '#bfdbfe' },
  { name: 'Peach', primary: '#ffb3c1', light: '#fecdd3' },
  { name: 'Lemon', primary: '#fee440', light: '#fef08a' },
  { name: 'Rose', primary: '#f4978e', light: '#fecaca' },
  { name: 'Aqua', primary: '#00f5d4', light: '#99f6e4' },
  { name: 'Lilac', primary: '#bdb2ff', light: '#e9d5ff' },
];

interface ThemeContextType {
  currentColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentColor, setCurrentColor] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('kawaii_theme_color');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return KAWAII_COLORS[0];
      }
    }
    return KAWAII_COLORS[0];
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-color', currentColor.primary);
    document.documentElement.style.setProperty('--theme-color-light', currentColor.light);
    localStorage.setItem('kawaii_theme_color', JSON.stringify(currentColor));
  }, [currentColor]);

  return (
    <ThemeContext.Provider value={{ currentColor, setThemeColor: setCurrentColor }}>
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
