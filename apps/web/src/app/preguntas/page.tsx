import type { Clinic, Faq } from "@hubnegocios/api-client";
import { PreguntasBuscador } from "@/components/preguntas-buscador";
import { api } from "@/lib/api";

/* Páginas de contenido: se regeneran cada minuto en vez de renderizarse en cada
   visita. Lo publica un administrador de tanto en tanto. */
export const revalidate = 60;

export const metadata = {
  title: "Preguntas frecuentes — Hub Negocios UDP",
};

/* El sitio de las preguntas. La home solo enseña unas pocas; el catálogo entero
   vive aquí, con búsqueda y filtro por clínica, que es lo que hace usable un
   listado largo. Cada clínica lo mantiene desde su panel y no hay tope: lo que
   crezca aparece aquí sin tocar código. */

export default async function PreguntasPage() {
  const clinics: Clinic[] = await api.clinics().catch(() => []);
  const porClinica = await Promise.all(
    clinics.map((c) => api.clinicFaqs(c.slug).catch((): Faq[] => [])),
  );

  const faqs = porClinica.flatMap((lista, i) =>
    lista.map((faq) => ({ ...faq, clinicName: clinics[i]?.name ?? faq.clinicSlug })),
  );

  return (
    <section className="seccion" id="preguntas" style={{ borderBottom: 0 }}>
      <div className="envoltura">
        <div className="seccion__cabeza">
          <div>
            <p className="etiqueta etiqueta--rojo">Consultas</p>
            <h1>Preguntas frecuentes</h1>
          </div>
        </div>

        {faqs.length === 0 ? (
          <p className="galeria__nota galeria__nota--sola">
            Todavía no hay preguntas publicadas. Cada clínica mantiene las suyas desde su panel de
            administración y aparecen aquí en cuanto las escribe.
          </p>
        ) : (
          <PreguntasBuscador clinics={clinics} faqs={faqs} />
        )}
      </div>
    </section>
  );
}
