import Link from "next/link";
import type { WebPageCopy } from "@/lib/copy";

/* La cabecera del diseño no usa logotipo: la marca es tipográfica — el nombre en
   serif y la unidad académica al costado, separada por un filete. El filete rojo
   superior es el gesto institucional que abre todas las páginas. */

export function SiteHeader({ copy }: { copy: WebPageCopy }) {
  return (
    <>
      <div className="filete" />
      <header className="cabecera">
        <div className="cabecera__interior">
          <Link href="/" className="marca">
            <span className="marca__nombre">{copy.siteName}</span>
            <span className="marca__unidad">
              Facultad de Derecho
              <br />
              Universidad Diego Portales
            </span>
          </Link>
          <nav className="nav" aria-label={copy.siteName}>
            <Link href="/clinicas">{copy.nav.clinics}</Link>
            <Link href="/articulos">{copy.nav.articles}</Link>
            <Link href="/contacto">{copy.nav.contact}</Link>
            <Link href="/ingreso" className="nav--destacado">
              {copy.nav.intake}
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
