"use client";

import { HubLogo, HubPreferenceControls } from "@hubnegocios/ui";
import { useAdminPreferences } from "@/lib/preferences";

export function AdminHeader() {
  const { theme, copy, setTheme } = useAdminPreferences();
  const webUrl = process.env.NEXT_PUBLIC_HUBNEGOCIOS_WEB_URL ?? "http://localhost:3100";
  const apiHealthUrl = (process.env.NEXT_PUBLIC_HUBNEGOCIOS_API_URL ?? "http://localhost:4000") + "/health";

  return (
    <header className="hub-shell__header hub-shell__header--static">
      <HubLogo />
      <nav className="hub-nav" aria-label={copy.navLabel}>
        <a href={webUrl}>{copy.web}</a>
        <a href={apiHealthUrl}>{copy.api}</a>
        <HubPreferenceControls
          theme={theme}
          labels={copy.preferences}
          onThemeChange={setTheme}
        />
      </nav>
    </header>
  );
}
