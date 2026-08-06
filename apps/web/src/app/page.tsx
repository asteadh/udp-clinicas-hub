import Link from "next/link";
import type { Article, Clinic, Faq, GalleryAlbum, TeamMember } from "@hubnegocios/api-client";
import { HomeFaq } from "@/components/home-faq";
import { IntakeExpediente } from "@/components/intake-expediente";
import { api } from "@/lib/api";
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
            <p className="portada__nota">
              Te atiende un estudiante de último año de Derecho UDP, con la supervisión directa de
              un profesor de la Facultad. <strong>No cobramos porque esto es parte de su
              formación</strong>, no una promoción ni un porcentaje del resultado.
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
            <p className="seccion__intro">
              Cada clínica atiende su materia con equipo propio y publica contenido propio. Un
              mismo formulario de ingreso conduce a las cuatro.
            </p>
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
      <section className="seccion" id="equipo">
        <div className="envoltura">
          <div className="seccion__cabeza">
            <div>
              <p className="etiqueta etiqueta--rojo">Equipo</p>
              <h2>Quién te atiende</h2>
            </div>
            <p className="seccion__intro">
              Tu caso lo trabaja un estudiante de los últimos años de Derecho UDP, con un ayudante
              que acompaña el día a día y un profesor de la Facultad que responde por cada
              decisión.
            </p>
          </div>

          <div className="roles">
            <div className="rol">
              <span className="rol__n">01</span>
              <h3>Profesora o profesor a cargo</h3>
              <p>
                Dirige la clínica y supervisa cada causa. Define si el caso se toma, aprueba la
                estrategia y responde académica y profesionalmente por el trabajo del equipo.
              </p>
            </div>
            <div className="rol">
              <span className="rol__n">02</span>
              <h3>Ayudante</h3>
              <p>
                Egresado o egresada de la Facultad. Hace el puente entre el profesor y los
                estudiantes, revisa escritos antes de que salgan y sostiene la continuidad del caso
                entre semestres.
              </p>
            </div>
            <div className="rol">
              <span className="rol__n">03</span>
              <h3>Estudiante</h3>
              <p>
                Alumna o alumno de los últimos años de la carrera. Es quien te entrevista, estudia
                tu caso y prepara los escritos. Para eso existe la clínica: es su formación, y por
                eso no se te cobra.
              </p>
            </div>
          </div>

          <div className="nomina">
            {clinics.map((clinic, i) => {
              const equipo = porOrden(teams[i] ?? []);
              const fichas = equipo.length > 0 ? equipo : [null, null];
              return (
                <div className="nomina__grupo" key={clinic.slug}>
                  <div className="nomina__clinica">
                    <span className="num">{numeral(i)}</span>
                    <h3>{clinic.name}</h3>
                  </div>
                  <div className="personas">
                    {fichas.map((persona, j) => (
                      <figure className="persona" key={persona?.id ?? j}>
                        <div className="retrato">
                          {persona?.photoUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={api.storageUrl(persona.photoUrl)} alt="" />
                          )}
                        </div>
                        <figcaption>
                          {persona?.fullName && (
                            <p className="persona__nombre">{persona.fullName}</p>
                          )}
                          <p className="persona__cargo">
                            {persona?.roleTitle ??
                              (j === 0 ? "Profesora o profesor a cargo" : "Ayudante")}
                          </p>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </div>
              );
            })}

            <p className="nomina__nota">
              Los nombres, retratos y biografías de cada integrante se cargan desde el panel de
              administración de su clínica. Cada ficha admite nombre completo, cargo, biografía,
              fotografía y correo de contacto.
            </p>
          </div>
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
            <p className="seccion__intro">
              Análisis firmado por los equipos de cada clínica sobre las materias que atendemos. Se
              publican desde el panel de administración de cada clínica.
            </p>
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
            <p className="seccion__intro">
              El registro fotográfico del trabajo de las clínicas: sesiones de clase, atenciones,
              audiencias y actividades de extensión.
            </p>
          </div>

          <div className="galeria">
            {clinics.map((clinic, i) => {
              const album = porOrden(galleries[i] ?? [])[0];
              return (
                <Link className="album" href={`/clinicas/${clinic.slug}`} key={clinic.slug}>
                  <div className="marco">
                    {album?.coverImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={api.storageUrl(album.coverImageUrl)} alt="" />
                    )}
                  </div>
                  <p className="album__clinica">{clinic.name}</p>
                  {album?.title && <h3 className="album__titulo">{album.title}</h3>}
                </Link>
              );
            })}

            <p className="galeria__nota">
              Cada clínica publica sus propios álbumes desde el panel de administración: título,
              descripción, portada y un pie de foto por imagen. Aquí se muestra el álbum más
              reciente de cada una; el resto se ve al entrar a la clínica.
            </p>
          </div>
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
            <p className="seccion__intro">
              Solicita formalmente la asistencia de una de nuestras clínicas jurídicas. Un
              integrante del equipo revisará tu caso y te contactará para confirmar si puede ser
              atendido.
            </p>
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
            <p className="seccion__intro">
              Las dudas que más se repiten en cada clínica, respondidas por sus equipos. Filtra por
              materia para ver solo lo que te corresponde.
            </p>
          </div>

          <HomeFaq clinics={clinics} faqs={faqs} />
        </div>
      </section>
    </>
  );
}
