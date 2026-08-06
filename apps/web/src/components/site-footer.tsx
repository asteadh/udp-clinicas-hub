import Link from "next/link";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

/* Pie del diseño: superficie oscura en ambos temas, marca tipográfica y dos
   columnas de enlaces. Las clínicas salen de la base, no están escritas a mano. */

export async function SiteFooter({ copy }: { copy: WebPageCopy }) {
  const clinics = await api.clinics().catch(() => []);

  return (
    <footer className="pie">
      <div className="pie__interior">
        <div className="pie__grid">
          <div>
            <p className="pie__marca">{copy.siteName}</p>
            <p className="pie__desc">{copy.footer.description}</p>
          </div>
          <div>
            <h5>{copy.footer.clinicsTitle}</h5>
            <ul>
              {clinics.map((clinic) => (
                <li key={clinic.slug}>
                  <Link href={`/clinicas/${clinic.slug}`}>{clinic.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>{copy.footer.quickLinksTitle}</h5>
            <ul>
              <li>
                <Link href="/clinicas">{copy.nav.clinics}</Link>
              </li>
              <li>
                <Link href="/articulos">{copy.nav.articles}</Link>
              </li>
              <li>
                <Link href="/ingreso">{copy.nav.intake}</Link>
              </li>
              <li>
                <Link href="/contacto">{copy.nav.contact}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pie__legal">
          <span>{copy.footer.rights}</span>
          <span>Facultad de Derecho</span>
        </div>
      </div>
    </footer>
  );
}
