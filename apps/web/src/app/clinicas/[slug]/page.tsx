import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Muro } from "@/components/muro";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";
import { aplanarMuro } from "@/lib/muro";

/* Páginas de contenido: se regeneran cada minuto en vez de renderizarse en cada
   visita. Lo publica un administrador de tanto en tanto. */
export const revalidate = 60;

/* Compuesta con el vocabulario del diseño, no con tarjetas: encabezado de
   sección, equipo en retratos, columnas en la retícula de la home, el muro de
   fotografías filtrado a esta clínica, el acordeón de preguntas y la llamada de
   cierre. La versión anterior era un icono en un círculo de color y cuatro
   rejillas idénticas, cada una con su contador. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const clinic = await api.clinic(slug).catch(() => null);
  return { title: clinic ? `${clinic.name} — Hub Negocios UDP` : copy.clinics.notFoundTitle };
}

function numeral(i: number) {
  return String(i + 1).padStart(2, "0");
}

export default async function ClinicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clinic = await api.clinic(slug).catch(() => null);
  if (!clinic) notFound();

  const [faqs, team, gallery, articles] = await Promise.all([
    api.clinicFaqs(slug).catch(() => []),
    api.clinicTeam(slug).catch(() => []),
    api.clinicGallery(slug).catch(() => []),
    api.clinicArticles(slug).catch(() => []),
  ]);

  const porOrden = <T extends { sortOrder?: number }>(l: T[]) =>
    [...l].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <>
      <section className="seccion">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Clínica</p>
              <h1>{clinic.name}</h1>
            </div>
            <p className="seccion__intro">{clinic.shortDescription}</p>
          </div>

          {clinic.descriptionHtml && (
            <div
              className="hub-prose"
              style={{ maxWidth: "var(--medida)" }}
              dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }}
            />
          )}

          <div className="llamada" style={{ marginTop: "3rem" }}>
            <div>
              <h3>{copy.clinics.ctaCardTitle}</h3>
              <p>{copy.clinics.ctaCardBody}</p>
            </div>
            <Link href={`/ingreso?clinica=${clinic.slug}`} className="boton">
              {copy.clinics.ctaCardButton}
            </Link>
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="seccion" id="equipo">
          <div className="envoltura">
            <div className="seccion__cabeza">
              <div>
                <p className="etiqueta etiqueta--rojo">Equipo</p>
                <h2>{copy.clinics.teamTitle}</h2>
              </div>
              <p className="seccion__intro">
                Quienes atienden esta clínica: el profesor o profesora a cargo, los ayudantes y
                los estudiantes de los últimos años que trabajan cada caso.
              </p>
            </div>
            <div className="personas">
              {porOrden(team).map((persona) => (
                <figure className="persona" key={persona.id}>
                  <div className="retrato">
                    {persona.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={api.storageUrl(persona.photoUrl)} alt="" />
                    )}
                  </div>
                  <figcaption>
                    <p className="persona__nombre">{persona.fullName}</p>
                    {persona.roleTitle && <p className="persona__cargo">{persona.roleTitle}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {articles.length > 0 && (
        <section className="seccion seccion--arena" id="columnas">
          <div className="envoltura">
            <div className="seccion__cabeza">
              <div>
                <p className="etiqueta etiqueta--rojo">Publicaciones</p>
                <h2>{copy.clinics.articlesTitle}</h2>
              </div>
              <p className="seccion__intro">
                Análisis firmado por el equipo de esta clínica sobre las materias que atiende.
              </p>
            </div>
            <div className="columnas">
              {articles.map((article) => (
                <article className="columna" key={article.id}>
                  <div className="columna__meta">
                    <span className="columna__clinica">
                      {clinic.name.replace(/^Clínica (de )?/, "")}
                    </span>
                    {article.publishedAt && (
                      <span>
                        {new Date(article.publishedAt).toLocaleDateString(copy.dateLocale, {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="columna__titulo">
                    <Link href={`/articulos/${article.slug}`}>{article.title}</Link>
                  </h3>
                  {article.excerpt && <p className="columna__bajada">{article.excerpt}</p>}
                  <p className="columna__firma">{article.authorName || clinic.name}</p>
                </article>
              ))}
            </div>
            <Link className="ver-todo" href="/articulos">
              Ver todas las columnas
            </Link>
          </div>
        </section>
      )}

      <section className="seccion" id="actividades">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Galería</p>
              <h2>{copy.clinics.galleryTitle}</h2>
            </div>
            <p className="seccion__intro">
              El registro fotográfico del trabajo de esta clínica, de lo más reciente a lo más
              antiguo.
            </p>
          </div>
          <Muro clinics={[]} fotos={aplanarMuro([clinic], [gallery])} dateLocale={copy.dateLocale} />
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="seccion" id="preguntas" style={{ borderBottom: 0 }}>
          <div className="envoltura">
            <div className="seccion__cabeza">
              <div>
                <p className="etiqueta etiqueta--rojo">Consultas</p>
                <h2>{copy.clinics.faqsTitle}</h2>
              </div>
              <p className="seccion__intro">
                Las dudas que más se repiten en esta clínica, respondidas por su equipo.
              </p>
            </div>
            <div className="faq">
              {porOrden(faqs).map((faq, i) => (
                <details className="faq__item" key={faq.id}>
                  <summary data-n={numeral(i)}>
                    {faq.question}
                    <span className="faq__signo" />
                  </summary>
                  <div className="faq__respuesta">
                    <div dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
