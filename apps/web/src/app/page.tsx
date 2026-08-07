import Link from "next/link";
import type { Article, Clinic, Faq, GalleryAlbum, TeamMember } from "@hubnegocios/api-client";
import { HomeFaq } from "@/components/home-faq";
import { IntakeExpediente } from "@/components/intake-expediente";
import { Muro } from "@/components/muro";
import { api } from "@/lib/api";
import { aplanarMuro } from "@/lib/muro";
import { webPageCopy as copy } from "@/lib/copy";

/* La home se regenera cada minuto en vez de renderizarse en cada visita. El
   contenido lo publica un administrador de tanto en tanto, así que un minuto de
   desfase no se nota, y evita repetir las catorce llamadas al API por visitante. */
export const revalidate = 60;

/* Reproduce la pieza de diseño aprobada (proyectos/hub-negocios-udp/index.html)
   sección por sección, con el mismo marcado y las mismas clases. Lo que allí es
   texto fijo, aquí sale de la base cuando existe el dato: clínicas, columnas,
   equipo, álbumes y preguntas.

   Equipo y galería no tienen endpoint global —el API solo responde por clínica,
   porque el panel se organiza así— de modo que se piden las cuatro y se toma una
   de cada una. */

const HOME_COLUMNAS = 6;

const MATERIAS: Record<string, string> = {
  insolvencia: "Ley 20.720 · SUPERIR · renegociación y liquidación",
  "innovacion-emprendimiento": "Sociedades · propiedad intelectual · contratos",
  laboral: "Despidos · finiquitos · tutela laboral",
  tributario: "Observaciones y liquidaciones del SII · TTA",
};

function numeral(i: number) {
  return String(i + 1).padStart(2, "0");
}

export default async function HomePage() {
  const clinics: Clinic[] = await api.clinics().catch(() => []);
  const slugs = clinics.map((c) => c.slug);

  const [articles, teams, galleries, faqsPorClinica] = await Promise.all([
    api.articles(1).catch((): Article[] => []),
    Promise.all(slugs.map((s) => api.clinicTeam(s).catch((): TeamMember[] => []))),
    Promise.all(slugs.map((s) => api.clinicGallery(s).catch((): GalleryAlbum[] => []))),
    Promise.all(slugs.map((s) => api.clinicFaqs(s).catch((): Faq[] => []))),
  ]);

  const faqs = faqsPorClinica.flatMap((lista, i) =>
    lista.map((faq) => ({ ...faq, clinicName: clinics[i]?.name ?? faq.clinicSlug })),
  );

  const porOrden = <T extends { sortOrder?: number }>(lista: T[]) =>
    [...lista].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <>
      {/* ══ PORTADA ═══════════════════════════════════════════════════════ */}
      <section className="portada">
        <div className="envoltura portada__grid">
          <div>
            <span className="portada__marca" />
            <h1>
              Cuatro clínicas jurídicas para las decisiones que <em>no admiten</em>{" "}
              improvisación.
            </h1>
            <p className="portada__bajada">
              Insolvencia, emprendimiento, trabajo e impuestos. Asesoría gratuita de la Facultad
              de Derecho de la Universidad Diego Portales.
            </p>
            <a href="#ingreso" className="boton">
              Presentar mi caso
            </a>
          </div>

          <nav className="sumario" aria-label="Índice de clínicas">
            <p className="etiqueta sumario__titulo">Las clínicas</p>
            <ul className="sumario__lista">
              {clinics.map((clinic, i) => (
                <li key={clinic.slug}>
                  <a href={`#${clinic.slug}`}>
                    <span className="num">{numeral(i)}</span>
                    <span>
                      <span className="sumario__nombre">{clinic.name}</span>
                      <span className="sumario__materia">
                        {MATERIAS[clinic.slug] ?? clinic.shortDescription}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* ══ CIFRAS ════════════════════════════════════════════════════════ */}
      <section className="seccion" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
        <div className="envoltura">
          <div className="cifras">
            <div className="cifra">
              <span className="cifra__valor">4</span>
              <span className="cifra__etiqueta">Clínicas jurídicas especializadas</span>
            </div>
            <div className="cifra">
              <span className="cifra__valor">
                <em>Sin costo</em>
              </span>
              <span className="cifra__etiqueta">Para quien consulta, en todas las etapas</span>
            </div>
            <div className="cifra">
              <span className="cifra__valor">
                <em>Supervisada</em>
              </span>
              <span className="cifra__etiqueta">Cada causa, por un profesor de la Facultad</span>
            </div>
            <div className="cifra">
              <span className="cifra__valor">UDP</span>
              <span className="cifra__etiqueta">
                Facultad de Derecho, Universidad Diego Portales
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LAS CUATRO CLÍNICAS ═══════════════════════════════════════════ */}
      <section className="seccion" id="clinicas">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Materias</p>
              <h2>Las clínicas</h2>
            </div>
          </div>

          {clinics.map((clinic, i) => (
            <article className="materia" id={clinic.slug} key={clinic.slug}>
              <div className="materia__num">{numeral(i)}</div>
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
                  className="materia__cuerpo"
                  dangerouslySetInnerHTML={{ __html: clinic.descriptionHtml }}
                />
              )}
            </article>
          ))}
        </div>
      </section>

      {/* ══ EQUIPO ════════════════════════════════════════════════════════ */}
      {/* Sin roles descritos ni retratos de relleno: el equipo cambia cada
          semestre, así que la sección se llena solo con lo que cada clínica
          publica desde su panel — nombre, cargo, biografía y foto, y solo si la
          hay. Los estudiantes rotan y no aparecen salvo que se les cargue. */}
      <section className="seccion" id="equipo">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Equipo</p>
              <h2>Quién te atiende</h2>
            </div>
          </div>

          {teams.some((t) => t.length > 0) ? (
            <div className="nomina">
              {clinics.map((clinic, i) => {
                const equipo = porOrden(teams[i] ?? []);
                if (equipo.length === 0) return null;
                return (
                  <div className="nomina__grupo" key={clinic.slug}>
                    <div className="nomina__clinica">
                      <span className="num">{numeral(i)}</span>
                      <h3>
                        <Link href={`/clinicas/${clinic.slug}`}>{clinic.name}</Link>
                      </h3>
                    </div>
                    <div className="personas">
                      {equipo.map((persona) => (
                        <figure className="persona" key={persona.id}>
                          {persona.photoUrl && (
                            <div className="retrato">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={api.storageUrl(persona.photoUrl)} alt="" />
                            </div>
                          )}
                          <figcaption>
                            <p className="persona__nombre">{persona.fullName}</p>
                            {persona.roleTitle && (
                              <p className="persona__cargo">{persona.roleTitle}</p>
                            )}
                            {persona.bioHtml && (
                              <div
                                className="persona__bio hub-prose"
                                dangerouslySetInnerHTML={{ __html: persona.bioHtml }}
                              />
                            )}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="galeria__nota galeria__nota--sola">
              Cada clínica publica su equipo desde su panel de administración. En cuanto carguen
              a sus integrantes aparecerán aquí, con el cargo y la biografía que cada una escriba.
            </p>
          )}
        </div>
      </section>

      {/* ══ COLUMNAS DE OPINIÓN ═══════════════════════════════════════════ */}
      <section className="seccion seccion--arena" id="columnas">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Publicaciones</p>
              <h2>Columnas de opinión</h2>
            </div>
          </div>

          <div className="columnas">
            {articles.slice(0, HOME_COLUMNAS).map((article) => {
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

          <Link className="ver-todo" href="/articulos">
            Ver todas las columnas
          </Link>
        </div>
      </section>

      {/* ══ ACTIVIDADES / GALERÍA ═════════════════════════════════════════ */}
      <section className="seccion" id="actividades">
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

      {/* ══ FORMULARIO DE INGRESO ═════════════════════════════════════════ */}
      <section className="seccion seccion--arena" id="ingreso">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Ingreso</p>
              <h2>Formulario de ingreso</h2>
            </div>
          </div>

          <IntakeExpediente clinics={clinics} />
        </div>
      </section>

      {/* ══ PREGUNTAS FRECUENTES ══════════════════════════════════════════ */}
      <section className="seccion" id="preguntas" style={{ borderBottom: 0 }}>
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Consultas</p>
              <h2>Preguntas frecuentes</h2>
            </div>
          </div>

          <HomeFaq clinics={clinics} faqs={faqs} />
        </div>
      </section>
    </>
  );
}
