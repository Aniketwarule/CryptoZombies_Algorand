// Theme system for AlgoZombies
export type ThemeMode = 'dark' | 'light' | 'system';

export interface Theme {
  name: string;
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    text: {
      primary: string;
      secondary: string;
      muted: string;
    };
    border: string;
    success: string;
    warning: string;
    error: string;
  };
}

export const darkTheme: Theme = {
  name: 'Dark',
  mode: 'dark',
  colors: {
    primary: '#10b981',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
    },
    border: '#334155',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

export const lightTheme: Theme = {
  name: 'Light',
  mode: 'light',
  colors: {
    primary: '#059669',
    secondary: '#7c3aed',
    accent: '#0891b2',
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#e2e8f0',
    },
    text: {
      primary: '#0f172a',
      secondary: '#334155',
      muted: '#64748b',
    },
    border: '#e2e8f0',
    success: '#16a34a',
    warning: '#d97706',
    error: '#dc2626',
  },
};

export const cyberpunkTheme: Theme = {
  name: 'Cyberpunk',
  mode: 'dark',
  colors: {
    primary: '#ff0080',
    secondary: '#00ffff',
    accent: '#ffff00',
    background: {
      primary: '#0a0a0a',
      secondary: '#1a0a1a',
      tertiary: '#2a1a2a',
    },
    text: {
      primary: '#ffffff',
      secondary: '#ff00ff',
      muted: '#808080',
    },
    border: '#ff0080',
    success: '#00ff00',
    warning: '#ffff00',
    error: '#ff0040',
  },
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
  cyberpunk: cyberpunkTheme,
};

export type ThemeName = keyof typeof themes;