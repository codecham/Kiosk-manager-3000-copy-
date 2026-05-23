import { useThemeStore } from '@/stores/theme.store';

interface UseThemeReturn {
  theme: 'light' | 'dark';
  isDark: boolean;
  toggleTheme: () => void;
}

export const useTheme = (): UseThemeReturn => {
  const { theme, toggleTheme } = useThemeStore();
  return {
    theme,
    isDark: theme === 'dark',
    toggleTheme,
  };
};