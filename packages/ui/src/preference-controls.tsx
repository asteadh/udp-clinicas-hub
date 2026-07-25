"use client";

import type { SVGProps } from "react";

export type HubThemePreference = "system" | "light" | "dark";

export type HubPreferenceLabels = {
  theme: string;
  system: string;
  light: string;
  dark: string;
};

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

const THEME_OPTIONS: { value: HubThemePreference; icon: typeof MonitorIcon }[] = [
  { value: "system", icon: MonitorIcon },
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
];

// Compact theme control: an icon segmented toggle (system/light/dark). Shared
// by the web header and the admin console footer.
export function HubPreferenceControls({
  theme,
  labels,
  onThemeChange,
}: {
  theme: HubThemePreference;
  labels: HubPreferenceLabels;
  onThemeChange: (theme: HubThemePreference) => void;
}) {
  const themeLabels: Record<HubThemePreference, string> = {
    system: labels.system,
    light: labels.light,
    dark: labels.dark,
  };

  return (
    <div className="hub-prefs" aria-label={labels.theme}>
      <div className="hub-prefs__theme" role="group" aria-label={labels.theme}>
        {THEME_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onThemeChange(value)}
            aria-pressed={theme === value}
            aria-label={themeLabels[value]}
            title={themeLabels[value]}
            className={`hub-prefs__seg${theme === value ? " is-active" : ""}`}
          >
            <Icon />
          </button>
        ))}
      </div>
    </div>
  );
}
