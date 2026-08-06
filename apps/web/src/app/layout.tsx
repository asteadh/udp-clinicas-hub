import "@hubnegocios/ui/styles.css";
import "./globals.css";
/* Va al final a propósito: es la hoja del diseño aprobado y debe ganar sobre
   los componentes hub-* en todo lo que se solape. */
import "./diseno.css";
import type { Metadata, Viewport } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { hubColors, hubColorsDark, type HubThemePreference } from "@hubnegocios/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { webPageCopy } from "@/lib/copy";

/* Equivalentes libres de la tipografía institucional UDP (Garamond Premier Pro
   y Museo Sans, que viven en kits de Adobe Fonts). Ver packages/ui/src/tokens.ts. */
const hubSans = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hub-sans",
  display: "swap",
});

const hubSerif = EB_Garamond({
  subsets: ["latin", "latin-ext"],
  variable: "--font-hub-serif",
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
    <html
      lang="es"
      data-theme={initialDataTheme}
      className={`${hubSans.variable} ${hubSerif.variable}`}
      suppressHydrationWarning
    >
      <body>
        <SiteHeader copy={webPageCopy} />
        <main className="hub-page">{children}</main>
        <SiteFooter copy={webPageCopy} />
      </body>
    </html>
  );
}
