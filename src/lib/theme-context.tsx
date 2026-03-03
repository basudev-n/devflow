"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColor] = useState("#6366f1");

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("crm_settings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.theme) {
        setTheme(settings.theme);
      }
      if (settings.accentColor) {
        setAccentColor(settings.accentColor);
      }
    }

    // Check legacy theme storage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && !savedSettings) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    // Apply accent color
    document.documentElement.style.setProperty("--accent-primary", accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ theme, accentColor, setTheme, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Return defaults if not in provider
    return {
      theme: "dark" as Theme,
      accentColor: "#6366f1",
      setTheme: () => {},
      setAccentColor: () => {},
    };
  }
  return context;
}
