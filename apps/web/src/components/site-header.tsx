import Link from "next/link";
import { HubLogo } from "@hubnegocios/ui";
import type { WebPageCopy } from "@/lib/copy";

export function SiteHeader({ copy }: { copy: WebPageCopy }) {
  return (
    <header className="hub-shell__header">
      <div className="site-header__inner">
        <Link href="/">
          <HubLogo />
        </Link>
        <nav className="hub-nav" aria-label={copy.siteName}>
          <Link href="/">{copy.nav.home}</Link>
          <Link href="/clinicas">{copy.nav.clinics}</Link>
          <Link href="/articulos">{copy.nav.articles}</Link>
          <Link href="/contacto">{copy.nav.contact}</Link>
        </nav>
      </div>
    </header>
  );
}
