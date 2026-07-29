const STORAGE_KEY = 'atlas-theme';

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme(onChange) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    setTheme(saved);
  } else {
    setTheme('dark');
  }

  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const sync = () => {
    toggle.setAttribute('aria-checked', getTheme() === 'light' ? 'true' : 'false');
    onChange?.(getTheme());
  };

  toggle.addEventListener('click', () => {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
    sync();
  });

  sync();
}

export const THEME_COLORS = {
  dark: { scene: 0x0a0e16, fog: 0x0a0e16 },
  light: { scene: 0xe8edf5, fog: 0xe8edf5 },
};
