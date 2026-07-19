import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'cyberquest-theme';

function apply(theme: Theme) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      return (localStorage.getItem(STORAGE_KEY) as Theme) || 'system';
    } catch {
      return 'system';
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    apply(theme);
  }, [theme]);

  useEffect(() => {
    const listener = () => {
      if (theme === 'system') apply('system');
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return { theme, setTheme };
}
