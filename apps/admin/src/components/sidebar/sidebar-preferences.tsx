"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { HubThemePreference } from "@hubnegocios/ui";
import { useAdminPreferences } from "@/lib/preferences";

const THEME_ORDER: HubThemePreference[] = ["system", "light", "dark"];

const THEME_ICON = {
  system: Monitor,
  light: Sun,
  dark: Moon,
} as const;

// Theme control, living in the sidebar footer next to the account. Expanded:
// an icon segmented theme toggle. Collapsed rail: a single theme button that
// cycles, with a native tooltip.
export function SidebarPreferences({ rail }: { rail: boolean }) {
  const { theme, copy, setTheme } = useAdminPreferences();
  const labels = copy.preferences;
  const themeLabels: Record<HubThemePreference, string> = {
    system: labels.system,
    light: labels.light,
    dark: labels.dark,
  };

  function cycleTheme() {
    const next = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length] ?? "system";
    setTheme(next);
  }

  if (rail) {
    const ThemeIcon = THEME_ICON[theme];
    return (
      <div className="flex flex-col items-center gap-0.5">
        <button
          type="button"
          onClick={cycleTheme}
          title={`${labels.theme}: ${themeLabels[theme]}`}
          aria-label={`${labels.theme}: ${themeLabels[theme]}`}
          className="grid size-8 place-items-center rounded-md text-hub-muted transition-colors hover:bg-hub-honey-soft hover:text-hub-ink"
        >
          <ThemeIcon className="size-4" aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <div
        role="group"
        aria-label={labels.theme}
        className="flex items-center gap-0.5 rounded-lg border border-hub-border p-0.5"
      >
        {THEME_ORDER.map((value) => {
          const Icon = THEME_ICON[value];
          const active = theme === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              aria-pressed={active}
              aria-label={themeLabels[value]}
              title={themeLabels[value]}
              className={`grid size-7 place-items-center rounded-md transition-colors ${
                active ? "bg-hub-honey-soft text-hub-gold-deep" : "text-hub-muted hover:text-hub-ink"
              }`}
            >
              <Icon className="size-4" aria-hidden />
            </button>
          );
        })}
      </div>
    </div>
  );
}
