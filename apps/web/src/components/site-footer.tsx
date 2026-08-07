import Link from "next/link";
import { LogoUdp } from "@/components/logo-udp";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

/* Pie de la pieza de diseño, con su marcado y sus clases. Las clínicas salen de
   la base en vez de estar escritas a mano. */

export async function SiteFooter({ copy }: { copy: WebPageCopy }) {
  const clinics = await api.clinics().catch(() => []);

  return (
    <footer className="pie">
      <div className="envoltura">
        <div className="pie__grid">
          <div>
            <LogoUdp variante="blanco" className="pie__logo" />
            <p className="pie__marca">{copy.siteName}</p>
            <p className="pie__desc">{copy.footer.description}</p>
          </div>
          <div>
            <h5>Clínicas</h5>
            <ul>
              {clinics.map((clinic) => (
                <li key={clinic.slug}>
                  <Link href={`/clinicas/${clinic.slug}`}>{clinic.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5>Secciones</h5>
            <ul>
              <li>
                <Link href="/#equipo">Quién te atiende</Link>
              </li>
              <li>
                <Link href="/actividad">Columnas y actividades</Link>
              </li>
              <li>
                <Link href="/ingreso">Formulario de ingreso</Link>
              </li>
              <li>
                <Link href="/#preguntas">Preguntas frecuentes</Link>
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
