import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  compactMode: boolean;
  setCompactMode: (mode: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const FONT_SIZES: Record<string, string> = { Small: '13px', Medium: '14px', Large: '16px' };

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme');
    return (stored === 'light' || stored === 'dark') ? stored : 'dark';
  });
  const [fontSize, setFontSize] = useState(() => localStorage.getItem('fontSize') || 'Medium');
  const [compactMode, setCompactMode] = useState(() => localStorage.getItem('compactMode') === 'true');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = FONT_SIZES[fontSize] || '14px';
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('compact-mode', compactMode);
    localStorage.setItem('compactMode', String(compactMode));
  }, [compactMode]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, fontSize, setFontSize, compactMode, setCompactMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
