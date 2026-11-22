import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const KEY = 'theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

const readStored = (): Theme | null => {
  try {
    const t = localStorage.getItem(KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
};

const systemTheme = (): Theme => (media().matches ? 'dark' : 'light');

// Тема по умолчанию — как в системе. Выбор вручную запоминается и перекрывает системную
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (document.documentElement.dataset.theme as Theme | undefined) ?? readStored() ?? systemTheme(),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    // Шапка браузера (Safari, Telegram) — цвета фона страницы, как --bg-page
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#000000' : '#f5f5f5');
  }, [theme]);

  useEffect(() => {
    const mq = media();
    const onChange = () => {
      if (!readStored()) setTheme(systemTheme());
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try {
        // Совпало с системной — снова следуем за системой
        if (next === systemTheme()) localStorage.removeItem(KEY);
        else localStorage.setItem(KEY, next);
      } catch {
        /* приватный режим: тема просто не запомнится */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
