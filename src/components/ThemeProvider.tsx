import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export interface ColorConfig {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  rgbPrimary: string;
  rgbLight: string;
  rgbDark: string;
}

export const NEON_COLORS: Record<string, { name: string; class: string; config: ColorConfig }> = {
  emerald: {
    name: "أخضر نيون زمردي",
    class: "bg-emerald-500",
    config: {
      primary: "#10b981",
      primaryDark: "#047857",
      primaryLight: "#34d399",
      rgbPrimary: "16, 185, 129",
      rgbLight: "52, 211, 153",
      rgbDark: "4, 120, 87"
    }
  },
  cyan: {
    name: "أزرق سماوي نيون",
    class: "bg-cyan-500",
    config: {
      primary: "#06b6d4",
      primaryDark: "#0891b2",
      primaryLight: "#22d3ee",
      rgbPrimary: "6, 182, 212",
      rgbLight: "34, 211, 238",
      rgbDark: "8, 145, 178"
    }
  },
  purple: {
    name: "أرجواني بنفسجي نيون",
    class: "bg-purple-500",
    config: {
      primary: "#a855f7",
      primaryDark: "#7e22ce",
      primaryLight: "#c084fc",
      rgbPrimary: "168, 85, 247",
      rgbLight: "192, 132, 252",
      rgbDark: "126, 34, 206"
    }
  },
  rose: {
    name: "ياقوت أحمر ناري",
    class: "bg-rose-500",
    config: {
      primary: "#f43f5e",
      primaryDark: "#be123c",
      primaryLight: "#fb7185",
      rgbPrimary: "244, 63, 94",
      rgbLight: "251, 113, 133",
      rgbDark: "190, 18, 60"
    }
  },
  amber: {
    name: "ذهبي نيون ورم",
    class: "bg-amber-500",
    config: {
      primary: "#f59e0b",
      primaryDark: "#b45309",
      primaryLight: "#fbbf24",
      rgbPrimary: "245, 158, 11",
      rgbLight: "251, 191, 36",
      rgbDark: "180, 83, 9"
    }
  },
  blue: {
    name: "أزرق نيون مشع",
    class: "bg-blue-600",
    config: {
      primary: "#2563eb",
      primaryDark: "#1d4ed8",
      primaryLight: "#60a5fa",
      rgbPrimary: "37, 99, 235",
      rgbLight: "96, 165, 250",
      rgbDark: "29, 78, 216"
    }
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  accent: string;
  setAccent: (accent: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'system';
  });

  const [accent, setAccent] = useState<string>(() => {
    return localStorage.getItem('app-accent') || 'emerald';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Handle dynamic style overrides for neon colors
  useEffect(() => {
    localStorage.setItem('app-accent', accent);
    
    // Remove if there's any existing style tag
    const existingStyle = document.getElementById('dynamic-theme-overrides');
    if (existingStyle) {
      existingStyle.remove();
    }

    const { config } = NEON_COLORS[accent] || NEON_COLORS.emerald;

    // Create a new style element with targeted overrides
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-theme-overrides';
    styleElement.innerHTML = `
      :root {
        --theme-primary: ${config.primary} !important;
        --theme-primary-dark: ${config.primaryDark} !important;
        --theme-primary-light: ${config.primaryLight} !important;
        --color-primary: ${config.primary} !important;
        --color-primary-dark: ${config.primaryDark} !important;
        --color-primary-light: ${config.primaryLight} !important;
      }
      
      .bg-emerald-500 { background-color: ${config.primaryLight} !important; }
      .bg-emerald-600 { background-color: ${config.primary} !important; }
      .bg-emerald-700 { background-color: ${config.primaryDark} !important; }
      
      .text-emerald-500 { color: ${config.primaryLight} !important; }
      .text-emerald-600 { color: ${config.primary} !important; }
      .text-emerald-700 { color: ${config.primaryDark} !important; }
      
      .border-emerald-500 { border-color: ${config.primaryLight} !important; }
      .border-emerald-600 { border-color: ${config.primary} !important; }
      .border-emerald-700 { border-color: ${config.primaryDark} !important; }
      
      .bg-emerald-500\\/10 { background-color: rgba(${config.rgbLight}, 0.1) !important; }
      .bg-emerald-500\\/20 { background-color: rgba(${config.rgbLight}, 0.2) !important; }
      .bg-emerald-600\\/10 { background-color: rgba(${config.rgbPrimary}, 0.1) !important; }
      .bg-emerald-600\\/20 { background-color: rgba(${config.rgbPrimary}, 0.2) !important; }
      .bg-emerald-750\\/10 { background-color: rgba(${config.rgbDark}, 0.1) !important; }
      .bg-emerald-700\\/10 { background-color: rgba(${config.rgbDark}, 0.1) !important; }
      
      .bg-emerald-50 { background-color: rgba(${config.rgbPrimary}, 0.08) !important; }
      .text-emerald-800 { color: ${config.primaryDark} !important; }
      .dark .text-emerald-400 { color: ${config.primaryLight} !important; }
      .dark .bg-emerald-950 { background-color: rgba(${config.rgbDark}, 0.15) !important; }
      .dark .border-emerald-500\\/20 { border-color: rgba(${config.rgbLight}, 0.2) !important; }
      .border-emerald-500\\/10 { border-color: rgba(${config.rgbLight}, 0.1) !important; }
      .border-emerald-500\\/20 { border-color: rgba(${config.rgbLight}, 0.2) !important; }
      .border-emerald-500\\/30 { border-color: rgba(${config.rgbLight}, 0.3) !important; }
      .border-emerald-500\\/40 { border-color: rgba(${config.rgbLight}, 0.4) !important; }
      .border-emerald-500\\/50 { border-color: rgba(${config.rgbLight}, 0.5) !important; }
      
      /* Gradients modifier */
      .from-emerald-600 { --tw-gradient-from: ${config.primary} !important; }
      .to-emerald-700 { --tw-gradient-to: ${config.primaryDark} !important; }
      .from-emerald-500 { --tw-gradient-from: ${config.primaryLight} !important; }
      .to-teal-500 { --tw-gradient-to: ${config.primary} !important; }
      .from-emerald-900 { --tw-gradient-from: rgba(${config.rgbDark}, 0.8) !important; }
      .to-emerald-950 { --tw-gradient-to: rgba(${config.rgbDark}, 0.95) !important; }
    `;
    document.head.appendChild(styleElement);
    
    return () => {
      styleElement.remove();
    };
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accent, setAccent }}>
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
