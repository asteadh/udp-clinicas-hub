import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";

/* Páginas de contenido: se regeneran cada minuto en vez de renderizarse en cada
   visita. Lo publica un administrador de tanto en tanto. */
export const revalidate = 60;

/* Reproduce columna.html, la segunda pieza de diseño aprobada: regreso, cabeza
   con origen y firma, portada, cuerpo, cierre con procedencia y llamada,
   columnas contiguas y «más de la misma clínica».
 *
 * Los estilos ya estaban: al copiar la hoja del diseño entera vinieron con ella
 * las reglas del artículo, cargadas y sin usar hasta ahora.
 *
 * Dos bloques del diseño no se pintan cuando no hay dato: la portada solo si la
 * columna tiene imagen, y la cita destacada no existe aquí — el editor del panel
 * no tiene forma de marcar una frase como destacada, así que inventarla sería
 * elegir por el autor. */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await api.article(slug).catch(() => null);
  return { title: article ? `${article.title} — Hub Negocios UDP` : copy.articles.notFoundTitle };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await api.article(slug).catch(() => null);
  if (!article) notFound();

  const [clinics, deLaClinica] = await Promise.all([
    api.clinics().catch(() => []),
    api.clinicArticles(article.clinicSlug).catch(() => []),
  ]);

  const clinic = clinics.find((c) => c.slug === article.clinicSlug);
  const hermanas = deLaClinica.filter((a) => a.slug !== article.slug);

  /* Anterior y siguiente dentro de la misma clínica, que llegan ordenadas por
     fecha descendente: la anterior en el listado es la más reciente. */
  const posicion = deLaClinica.findIndex((a) => a.slug === article.slug);
  const masReciente = posicion > 0 ? deLaClinica[posicion - 1] : null;
  const masAntigua =
    posicion >= 0 && posicion < deLaClinica.length - 1 ? deLaClinica[posicion + 1] : null;

  const fecha = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(copy.dateLocale, { dateStyle: "long" })
    : null;

  return (
    <>
      <div className="envoltura regreso">
        <Link href="/actividad">
          <svg viewBox="0 0 15 9" fill="none" aria-hidden="true">
            <path d="M14 4.5H1M1 4.5L4.5 1M1 4.5L4.5 8" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Volver a columnas
        </Link>
      </div>

      <article className="articulo" id="lectura">
        <div className="envoltura">
          <header className="articulo__cabeza">
            <div className="articulo__origen">
              <Link href={`/clinicas/${article.clinicSlug}`}>
                {clinic?.name ?? article.clinicSlug}
              </Link>
            </div>
            <h1>{article.title}</h1>
            {article.excerpt && <p className="articulo__bajada">{article.excerpt}</p>}
            {(article.authorName || fecha) && (
              <div className="firma">
                {article.authorName && <p className="firma__autor">{article.authorName}</p>}
                {fecha && (
                  <p className="firma__fecha">
                    <time dateTime={article.publishedAt ?? undefined}>{fecha}</time>
                  </p>
                )}
              </div>
            )}
          </header>

          {article.coverImageUrl && (
            <figure className="portada-art">
              <div className="portada-art__marco">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={api.storageUrl(article.coverImageUrl)} alt="" />
              </div>
            </figure>
          )}

          {article.bodyHtml && (
            <div
              className="cuerpo cuerpo--entrada hub-prose"
              dangerouslySetInnerHTML={{ __html: article.bodyHtml }}
            />
          )}

          <div className="cierre">
            {clinic && (
              <div className="procedencia">
                <strong>{clinic.name}</strong>
                {clinic.shortDescription}
              </div>
            )}

            <div className="llamada">
              <div>
                <h3>{copy.articles.ctaTitle}</h3>
                <p>{copy.articles.ctaBody}</p>
              </div>
              <Link href="/ingreso" className="boton">
                {copy.articles.ctaButton}
              </Link>
            </div>

            {(masReciente || masAntigua) && (
              <nav className="contiguas" aria-label="Columnas contiguas">
                {masAntigua ? (
                  <Link className="contigua" href={`/articulos/${masAntigua.slug}`}>
                    <span className="contigua__dir">{copy.articles.prev}</span>
                    <p className="contigua__tit">{masAntigua.title}</p>
                  </Link>
                ) : (
                  <span />
                )}
                {masReciente && (
                  <Link
                    className="contigua contigua--sig"
                    href={`/articulos/${masReciente.slug}`}
                  >
                    <span className="contigua__dir">{copy.articles.next}</span>
                    <p className="contigua__tit">{masReciente.title}</p>
                  </Link>
                )}
              </nav>
            )}
          </div>
        </div>
      </article>

      {hermanas.length > 0 && (
        <section className="mas">
          <div className="envoltura">
            <div className="mas__cabeza">
              <p className="etiqueta etiqueta--rojo">Misma clínica</p>
              <h2>Más de {clinic?.name.replace(/^Clínica (de )?/, "") ?? article.clinicSlug}</h2>
            </div>
            <div className="columnas">
              {hermanas.slice(0, 3).map((a) => (
                <article className="columna" key={a.id}>
                  <div className="columna__meta">
                    <span className="columna__clinica">
                      {clinic?.name.replace(/^Clínica (de )?/, "") ?? a.clinicSlug}
                    </span>
                    {a.publishedAt && (
                      <span>
                        {new Date(a.publishedAt).toLocaleDateString(copy.dateLocale, {
                          year: "numeric",
                          month: "long",
                        })}
                      </span>
                    )}
                  </div>
                  <h3 className="columna__titulo">
                    <Link href={`/articulos/${a.slug}`}>{a.title}</Link>
                  </h3>
                  {a.excerpt && <p className="columna__bajada">{a.excerpt}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
