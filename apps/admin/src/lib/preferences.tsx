"use client";

import type { HubThemePreference } from "@hubnegocios/ui";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const themeStorageKey = "hub-theme";

const adminCopy = {
  navLabel: "Admin",
  web: "Web",
  api: "API",
  preferences: {
    theme: "Tema",
    system: "Sistema",
    light: "Claro",
    dark: "Oscuro",
  },
};

type PreferencesContextValue = {
  theme: HubThemePreference;
  copy: typeof adminCopy;
  setTheme: (theme: HubThemePreference) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function AdminPreferencesProvider({
  initialTheme,
  children,
}: {
  initialTheme: HubThemePreference;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<HubThemePreference>(initialTheme);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const resolvedTheme = theme === "system" ? (media.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = resolvedTheme;
      localStorage.setItem(themeStorageKey, theme);
      document.cookie = `${themeStorageKey}=${theme}; Path=/; Max-Age=31536000; SameSite=Lax`;
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      copy: adminCopy,
      setTheme,
    }),
    [theme],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useAdminPreferences() {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error("useAdminPreferences must be used inside AdminPreferencesProvider");
  }
  return value;
}
