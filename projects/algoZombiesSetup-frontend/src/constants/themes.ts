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

export const oceanTheme: Theme = {
  name: 'Ocean',
  mode: 'dark',
  colors: {
    primary: '#0ea5e9',
    secondary: '#0284c7',
    accent: '#06b6d4',
    background: {
      primary: '#0c4a6e',
      secondary: '#075985',
      tertiary: '#0369a1',
    },
    text: {
      primary: '#f0f9ff',
      secondary: '#bae6fd',
      muted: '#7dd3fc',
    },
    border: '#0369a1',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
};

export const forestTheme: Theme = {
  name: 'Forest',
  mode: 'dark',
  colors: {
    primary: '#059669',
    secondary: '#065f46',
    accent: '#10b981',
    background: {
      primary: '#064e3b',
      secondary: '#065f46',
      tertiary: '#047857',
    },
    text: {
      primary: '#f0fdf4',
      secondary: '#bbf7d0',
      muted: '#86efac',
    },
    border: '#047857',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
};

export const sunsetTheme: Theme = {
  name: 'Sunset',
  mode: 'dark',
  colors: {
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    background: {
      primary: '#7c2d12',
      secondary: '#9a3412',
      tertiary: '#c2410c',
    },
    text: {
      primary: '#fff7ed',
      secondary: '#fed7aa',
      muted: '#fdba74',
    },
    border: '#c2410c',
    success: '#22c55e',
    warning: '#eab308',
    error: '#dc2626',
  },
};

export const themes = {
  dark: darkTheme,
  light: lightTheme,
  cyberpunk: cyberpunkTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
};

export type ThemeName = keyof typeof themes;