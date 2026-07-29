import Link from "next/link";
import { HubLogo } from "@hubnegocios/ui";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

export async function SiteFooter({ copy }: { copy: WebPageCopy }) {
  const clinics = await api.clinics().catch(() => []);

  return (
    <footer className="site-footer">
      <div className="hub-page" style={{ padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.4fr) repeat(2, minmax(140px, 1fr))",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <HubLogo />
            <p style={{ marginTop: "0.6rem", maxWidth: "360px" }}>{copy.footer.description}</p>
          </div>
          <div>
            <strong>{copy.footer.quickLinksTitle}</strong>
            <nav className="grid gap-2" style={{ marginTop: "0.6rem" }}>
              <Link href="/">{copy.nav.home}</Link>
              <Link href="/clinicas">{copy.nav.clinics}</Link>
              <Link href="/articulos">{copy.nav.articles}</Link>
              <Link href="/contacto">{copy.nav.contact}</Link>
              <Link href="/ingreso">{copy.nav.intake}</Link>
            </nav>
          </div>
          <div>
            <strong>{copy.footer.clinicsTitle}</strong>
            <nav className="grid gap-2" style={{ marginTop: "0.6rem" }}>
              {clinics.map((clinic) => (
                <Link key={clinic.slug} href={`/clinicas/${clinic.slug}`}>
                  {clinic.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <p>{copy.footer.rights}</p>
      </div>
    </footer>
  );
}
