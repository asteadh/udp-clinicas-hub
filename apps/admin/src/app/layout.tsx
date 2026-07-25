import "@hubnegocios/ui/styles.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { hubColors, hubColorsDark, type HubThemePreference } from "@hubnegocios/ui";
import { AdminPreferencesProvider } from "@/lib/preferences";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hub Negocios UDP — Admin",
  description: "Panel de administración de Hub Negocios UDP",
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: hubColors.warmSurface },
    { media: "(prefers-color-scheme: dark)", color: hubColorsDark.warmSurface },
  ],
};

function readTheme(raw: string | undefined): HubThemePreference {
  return raw === "light" || raw === "dark" || raw === "system" ? raw : "system";
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const initialTheme = readTheme(cookieStore.get("hub-theme")?.value);
  const initialDataTheme = initialTheme === "dark" ? "dark" : "light";

  return (
    <html lang="es" data-theme={initialDataTheme} className={inter.variable} suppressHydrationWarning>
      <body>
        <AdminPreferencesProvider initialTheme={initialTheme}>
          {children}
        </AdminPreferencesProvider>
      </body>
    </html>
  );
}
