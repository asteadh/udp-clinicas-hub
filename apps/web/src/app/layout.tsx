import "@hubnegocios/ui/styles.css";
import "./globals.css";
/* Va al final a propósito: es la hoja del diseño aprobado y debe ganar sobre
   los componentes hub-* en todo lo que se solape. */
import "./diseno.css";
import type { Metadata, Viewport } from "next";
import { EB_Garamond, Hanken_Grotesk } from "next/font/google";
import { hubColors, hubColorsDark } from "@hubnegocios/ui";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { webPageCopy } from "@/lib/copy";

/* Equivalentes libres de la tipografía institucional UDP (Garamond Premier Pro
   y Museo Sans, que viven en kits de Adobe Fonts). Ver packages/ui/src/tokens.ts.

   Solo el subconjunto `latin`: cubre el castellano entero — acentos, ñ, ü, ¿ y ¡.
   `latin-ext` es para lenguas de Europa central y oriental, y duplicaba el peso
   de los archivos para nada.

   La cursiva se carga solo en el serif, que es donde el diseño la usa (el énfasis
   del titular y las cifras). La sans va únicamente en redonda. */
const hubSans = Hanken_Grotesk({
  subsets: ["latin"],
  style: ["normal"],
  variable: "--font-hub-sans",
  display: "swap",
});

const hubSerif = EB_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
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

/* El tema se resolvía leyendo una cookie en el servidor, y eso volvía dinámicas
   TODAS las rutas del sitio: basta con que el layout use cookies() para que
   ninguna página pueda cachearse. Ahora lo decide este script, que corre antes
   del primer pintado y evita igual el parpadeo.

   El claro es el modo por defecto. Sin preferencia guardada se fija
   data-theme="light" de forma explícita, que es lo que impide que la consulta
   `prefers-color-scheme: dark` de la hoja se active sola en un equipo con el
   sistema en oscuro. El oscuro es una elección del visitante, no un accidente
   de su configuración; quien prefiera seguir al sistema puede elegirlo en el
   ciclo del selector. */
const GUION_TEMA = `(function(){try{var t=localStorage.getItem("hub-tema");if(t==="oscuro")document.documentElement.setAttribute("data-theme","dark");else if(t==="sistema")document.documentElement.removeAttribute("data-theme");else document.documentElement.setAttribute("data-theme","light")}catch(e){document.documentElement.setAttribute("data-theme","light")}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${hubSans.variable} ${hubSerif.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: GUION_TEMA }} />
      </head>
      <body>
        <SiteHeader copy={webPageCopy} />
        <main className="hub-page">{children}</main>
        <SiteFooter copy={webPageCopy} />
      </body>
    </html>
  );
}
