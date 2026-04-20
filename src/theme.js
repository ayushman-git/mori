export const THEME_STORAGE_KEY = 'mori.theme.v1';

export const THEME_META_COLORS = {
  dark: '#0D0D0D',
  light: '#F4F1EB',
};

/** @param {'light' | 'dark'} theme */
export function applyDocumentTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_META_COLORS[theme]);
  }
}
