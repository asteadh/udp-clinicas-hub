import Link from "next/link";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

/* Páginas de contenido: se regeneran cada minuto en vez de renderizarse en cada
   visita. Lo publica un administrador de tanto en tanto. */
export const revalidate = 60;

export const metadata = {
  title: "Clínicas — Hub Negocios UDP",
};

/* Usa el bloque .materia del diseño, el mismo con el que la home presenta las
   cuatro clínicas: número, nombre, resumen, correo y cuerpo. No hay tarjetas con
   icono en un círculo de color — esa era la versión anterior, y el color venía
   de clinics.color_primary, que hoy es un campo de texto libre. */

function numeral(i: number) {
  return String(i + 1).padStart(2, "0");
}

export default async function ClinicsPage() {
  const clinics = await api.clinics().catch(() => []);

  return (
    <section className="seccion" style={{ borderBottom: 0 }}>
      <div className="envoltura">
        <div className="seccion__cabeza">
          <div>
            <p className="etiqueta etiqueta--rojo">Materias</p>
            <h1>{copy.clinics.title}</h1>
          </div>
          <p className="seccion__intro">{copy.clinics.intro}</p>
        </div>

        {clinics.map((clinic, i) => (
          <article className="materia" id={clinic.slug} key={clinic.slug}>
            <div className="materia__num">{numeral(i)}</div>
            <div>
              <h3>
                <Link href={`/clinicas/${clinic.slug}`}>{clinic.name}</Link>
              </h3>
              <p className="materia__resumen">{clinic.shortDescription}</p>
              <div className="materia__pie">
                {clinic.contactEmail && (
                  <a href={`mailto:${clinic.contactEmail}`} className="materia__correo">
                    {clinic.contactEmail}
                  </a>
                )}
              </div>
            </div>
            <div className="materia__cuerpo">
              {clinic.descriptionHtml && (
                <div dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }} />
              )}
              <Link className="ver-todo" href={`/clinicas/${clinic.slug}`}>
                {copy.home.viewClinic}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
