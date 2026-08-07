import Link from "next/link";
import type { Clinic, GalleryAlbum } from "@hubnegocios/api-client";
import { Muro } from "@/components/muro";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";
import { aplanarMuro } from "@/lib/muro";

/* Lee searchParams para paginar las columnas, así que se renderiza por petición.
   Los datos siguen viniendo de la caché de un minuto del cliente del API. */
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Actividad — Hub Negocios UDP",
};

/* Lo que publican las clínicas, separado de la parte institucional: las columnas
   de opinión y el muro de fotografías en un solo sitio. La home queda para
   presentar las clínicas y recibir casos; esto es el flujo que cambia. */

const PAGE_SIZE = 20;

export default async function ActividadPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;

  const clinics: Clinic[] = await api.clinics().catch(() => []);
  const [articles, galleries] = await Promise.all([
    api.articles(page).catch(() => []),
    Promise.all(
      clinics.map((c) => api.clinicGallery(c.slug).catch((): GalleryAlbum[] => [])),
    ),
  ]);
  const hasNext = articles.length === PAGE_SIZE;

  return (
    <>
      <section className="seccion" id="columnas">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Publicaciones</p>
              <h1>Columnas de opinión</h1>
            </div>
          </div>

          {articles.length > 0 ? (
            <>
              <div className="columnas">
                {articles.map((article) => {
                  const clinic = clinics.find((c) => c.slug === article.clinicSlug);
                  return (
                    <article className="columna" key={article.id}>
                      <div className="columna__meta">
                        <span className="columna__clinica">
                          {clinic?.name.replace(/^Clínica (de )?/, "") ?? article.clinicSlug}
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
                      <p className="columna__firma">{article.authorName || clinic?.name}</p>
                    </article>
                  );
                })}
              </div>

              {(page > 1 || hasNext) && (
                <div className="paginacion">
                  {page > 1 ? (
                    <Link className="ver-todo" href={`/actividad?page=${page - 1}`}>
                      {copy.articles.prev}
                    </Link>
                  ) : (
                    <span />
                  )}
                  {hasNext && (
                    <Link className="ver-todo" href={`/actividad?page=${page + 1}`}>
                      {copy.articles.next}
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="galeria__nota galeria__nota--sola">{copy.articles.noArticles}</p>
          )}
        </div>
      </section>

      <section className="seccion seccion--arena" id="actividades" style={{ borderBottom: 0 }}>
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Galería</p>
              <h2>Clases y actividades</h2>
            </div>
          </div>
          <Muro
            clinics={clinics}
            fotos={aplanarMuro(clinics, galleries)}
            dateLocale={copy.dateLocale}
          />
        </div>
      </section>
    </>
  );
}
