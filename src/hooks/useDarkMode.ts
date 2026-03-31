// src/hooks/useDarkMode.js
import { useState, useEffect } from 'react';

export function useDarkMode(): { isDark: boolean; toggleDarkMode: () => void } {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleDarkMode = (): void => {
    setIsDark((prev) => !prev);
  };

  return { isDark, toggleDarkMode };
}
