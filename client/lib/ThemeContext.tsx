"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeName = 'classic' | 'light' | 'nord';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('classic');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('akaza-theme') as ThemeName;
    if (saved && ['classic', 'light', 'nord'].includes(saved)) {
      setThemeState(saved);
    }
    setMounted(true);
  }, []);

  // Apply theme to <html> and persist
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('akaza-theme', theme);
    }
  }, [theme, mounted]);

  const setTheme = (t: ThemeName) => {
    setThemeState(t);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

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
