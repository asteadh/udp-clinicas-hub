import Link from "next/link";
import type { Article, Clinic, Faq, GalleryAlbum, TeamMember } from "@hubnegocios/api-client";
import { HomeFaq } from "@/components/home-faq";
import { IntakeForm } from "@/components/intake-form";
import { api } from "@/lib/api";
import { webPageCopy as copy } from "@/lib/copy";
import "./home.css";

export const dynamic = "force-dynamic";

/* La home es un escaparate: muestra una probada de cada cosa y lleva a la página
   real. Equipo y galería no tienen endpoint global — el API solo sabe responder
   "dame el equipo de la clínica X" — así que se piden por clínica y se muestra
   uno de cada una, que además es un criterio con sentido y no un muro de caras. */

const HOME_ARTICLES = 6;

function numeral(index: number) {
  return String(index + 1).padStart(2, "0");
}

/** Quien encabeza la clínica: el primero por sortOrder, que es el orden que fija
 *  el panel. Si la clínica aún no carga equipo, la ficha va vacía a propósito. */
function lead(team: TeamMember[]): TeamMember | undefined {
  return [...team].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
}

function latestAlbum(albums: GalleryAlbum[]): GalleryAlbum | undefined {
  return [...albums].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))[0];
}

export default async function HomePage() {
  const clinics: Clinic[] = await api.clinics().catch(() => []);
  const slugs = clinics.map((clinic) => clinic.slug);

  const [articles, teams, galleries, faqsByClinic] = await Promise.all([
    api.articles(1).catch((): Article[] => []),
    Promise.all(slugs.map((slug) => api.clinicTeam(slug).catch((): TeamMember[] => []))),
    Promise.all(slugs.map((slug) => api.clinicGallery(slug).catch((): GalleryAlbum[] => []))),
    Promise.all(slugs.map((slug) => api.clinicFaqs(slug).catch((): Faq[] => []))),
  ]);

  /* El filtro del cliente necesita el nombre de la clínica junto a cada pregunta,
     porque las respuestas se muestran mezcladas cuando el filtro está en "todas". */
  const faqs = faqsByClinic.flatMap((clinicFaqs, index) =>
    clinicFaqs.map((faq) => ({ ...faq, clinicName: clinics[index]?.name ?? faq.clinicSlug })),
  );

  const albums = galleries
    .map((clinicAlbums, index) => {
      const album = latestAlbum(clinicAlbums);
      return album ? { album, clinic: clinics[index] } : null;
    })
    .filter((entry): entry is { album: GalleryAlbum; clinic: Clinic } => entry !== null);

  return (
    <div className="home">
      {/* ══ PORTADA ══════════════════════════════════════════════════════ */}
      <section className="portada">
        <div className="envoltura portada__grid">
          <div>
            <span className="portada__marca" />
            <h1>
              Cuatro clínicas jurídicas para las decisiones que{" "}
              <em>{copy.home.titleEmphasis}</em> improvisación.
            </h1>
            <p className="portada__bajada">{copy.home.subtitle}</p>
            <p className="portada__nota">
              {copy.home.note} <strong>{copy.home.noteStrong}</strong>
              {copy.home.noteEnd}
            </p>
            <Link href="/ingreso" className="boton">
              {copy.home.cta}
            </Link>
          </div>

          <nav className="sumario" aria-label={copy.home.summaryTitle}>
            <p className="etiqueta sumario__titulo">{copy.home.summaryTitle}</p>
            <ul className="sumario__lista">
              {clinics.map((clinic, index) => (
                <li key={clinic.slug}>
                  <Link href={`/clinicas/${clinic.slug}`}>
                    <span className="num">{numeral(index)}</span>
                    <span>
                      <span className="sumario__nombre">{clinic.name}</span>
                      <span className="sumario__materia">
                        {copy.home.summaryMatters[clinic.slug] ?? clinic.shortDescription}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ══ CIFRAS ═══════════════════════════════════════════════════════ */}
      <section className="seccion seccion--angosta">
        <div className="envoltura">
          <div className="cifras">
            {copy.home.stats.map((stat) => (
              <div className="cifra" key={stat.label}>
                <span className="cifra__valor">
                  {stat.emphasis ? <em>{stat.value}</em> : stat.value}
                </span>
                <span className="cifra__etiqueta">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LAS CUATRO CLÍNICAS ══════════════════════════════════════════ */}
      <section className="seccion" id="clinicas">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">{copy.home.clinicsEyebrow}</p>
              <h2>{copy.home.clinicsTitle}</h2>
            </div>
            <p className="seccion__intro">{copy.home.clinicsSubtitle}</p>
          </div>

          {clinics.map((clinic, index) => (
            <article className="materia" key={clinic.slug} id={clinic.slug}>
              <div className="materia__num">{numeral(index)}</div>
              <div>
                <h3>
                  <Link href={`/clinicas/${clinic.slug}`}>{clinic.name}</Link>
                </h3>
                <p className="materia__resumen">{clinic.shortDescription}</p>
                {clinic.contactEmail && (
                  <div className="materia__pie">
                    <a href={`mailto:${clinic.contactEmail}`} className="materia__correo">
                      {clinic.contactEmail}
                    </a>
                  </div>
                )}
              </div>
              {clinic.descriptionHtml && (
                <div
                  className="materia__cuerpo hub-prose"
                  dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }}
                />
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ══ EQUIPO ═══════════════════════════════════════════════════════ */}
      <section className="seccion" id="equipo">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">{copy.home.teamEyebrow}</p>
              <h2>{copy.home.teamTitle}</h2>
            </div>
            <p className="seccion__intro">{copy.home.teamSubtitle}</p>
          </div>

          <div className="roles">
            {copy.home.roles.map((role, index) => (
              <div className="rol" key={role.title}>
                <span className="rol__n">{numeral(index)}</span>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </div>
            ))}
          </div>

          <div className="nomina">
            <div className="personas">
              {clinics.map((clinic, index) => {
                const persona = lead(teams[index] ?? []);
                return (
                  <Link className="persona" href={`/clinicas/${clinic.slug}`} key={clinic.slug}>
                    <div className="retrato">
                      {persona?.photoUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={api.storageUrl(persona.photoUrl)} alt="" />
                      )}
                    </div>
                    {persona?.fullName && <p className="persona__nombre">{persona.fullName}</p>}
                    <p className="persona__clinica">{clinic.name}</p>
                    <p className="persona__cargo">
                      {persona?.roleTitle ?? copy.home.teamLeadRole}
                    </p>
                    <span className="persona__ver">{copy.home.teamViewAll}</span>
                  </Link>
                );
              })}
            </div>
            <p className="nomina__nota">{copy.home.teamNote}</p>
          </div>
        </div>
      </section>

      {/* ══ COLUMNAS DE OPINIÓN ══════════════════════════════════════════ */}
      {articles.length > 0 && (
        <section className="seccion seccion--arena" id="columnas">
          <div className="envoltura">
            <div className="seccion__cabeza">
              <div>
                <p className="etiqueta etiqueta--rojo">{copy.home.articlesEyebrow}</p>
                <h2>{copy.home.articlesTitle}</h2>
              </div>
              <p className="seccion__intro">{copy.home.articlesSubtitle}</p>
            </div>

            <div className="columnas">
              {articles.slice(0, HOME_ARTICLES).map((article) => {
                const clinic = clinics.find((item) => item.slug === article.clinicSlug);
                return (
                  <article className="columna" key={article.id}>
                    <div className="columna__meta">
                      <span className="columna__clinica">{clinic?.name ?? article.clinicSlug}</span>
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
                    {article.authorName && <p className="columna__firma">{article.authorName}</p>}
                  </article>
                );
              })}
            </div>

            <Link className="ver-todo" href="/articulos">
              {copy.home.articlesViewAll}
            </Link>
          </div>
        </section>
      )}

      {/* ══ ACTIVIDADES / GALERÍA ════════════════════════════════════════ */}
      <section className="seccion" id="actividades">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">{copy.home.galleryEyebrow}</p>
              <h2>{copy.home.galleryTitle}</h2>
            </div>
            <p className="seccion__intro">{copy.home.gallerySubtitle}</p>
          </div>

          {albums.length > 0 ? (
            <div className="galeria">
              {albums.map(({ album, clinic }) => (
                <Link className="album" href={`/clinicas/${clinic.slug}`} key={album.id}>
                  <div className="marco">
                    {album.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={api.storageUrl(album.coverImageUrl)} alt="" />
                    )}
                  </div>
                  <p className="album__clinica">{clinic.name}</p>
                  <h3 className="album__titulo">{album.title}</h3>
                </Link>
              ))}
              <p className="galeria__nota">{copy.home.galleryNote}</p>
            </div>
          ) : (
            <p className="galeria__nota galeria__nota--sola">{copy.home.galleryEmpty}</p>
          )}
        </div>
      </section>

      {/* ══ FORMULARIO DE INGRESO ════════════════════════════════════════ */}
      <section className="seccion seccion--arena" id="ingreso">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">{copy.home.intakeEyebrow}</p>
              <h2>{copy.home.intakeTitle}</h2>
            </div>
            <p className="seccion__intro">{copy.home.intakeSubtitle}</p>
          </div>

          <div className="ingreso">
            <IntakeForm clinics={clinics} copy={copy} />
          </div>
        </div>
      </section>

      {/* ══ PREGUNTAS FRECUENTES ═════════════════════════════════════════ */}
      {faqs.length > 0 && (
        <section className="seccion seccion--final" id="preguntas">
          <div className="envoltura">
            <div className="seccion__cabeza">
              <div>
                <p className="etiqueta etiqueta--rojo">{copy.home.faqEyebrow}</p>
                <h2>{copy.home.faqTitle}</h2>
              </div>
              <p className="seccion__intro">{copy.home.faqSubtitle}</p>
            </div>

            <HomeFaq clinics={clinics} faqs={faqs} filterAllLabel={copy.home.faqFilterAll} />
          </div>
        </section>
      )}
    </div>
  );
}
