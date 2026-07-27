import "@hubnegocios/ui/styles.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { hubColors, hubColorsDark, type HubThemePreference } from "@hubnegocios/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { webPageCopy } from "@/lib/copy";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hub Negocios UDP",
  description:
    "Clínicas jurídicas de la Universidad Diego Portales: insolvencia, innovación y emprendimiento, laboral y tributario.",
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
        <SiteHeader copy={webPageCopy} />
        <main className="hub-page">{children}</main>
        <SiteFooter copy={webPageCopy} />
      </body>
    </html>
  );
}
