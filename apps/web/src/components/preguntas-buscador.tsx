"use client";

import type { Clinic, Faq } from "@hubnegocios/api-client";
import { useMemo, useState } from "react";

/* Buscador de preguntas frecuentes. Pensado para un catálogo largo —el encargo
   habla de unas trescientas— donde una lista sin filtro ni búsqueda no sirve de
   nada: nadie recorre trescientos acordeones.

   Filtra en el cliente porque ya vienen todas cargadas y el API no pagina esta
   consulta. A este tamaño es instantáneo; si algún día fueran miles, la búsqueda
   tendría que hacerla la base. */

const TODAS = "todas";

/** Quita el marcado de la respuesta para poder buscar dentro de su texto. */
function texto(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
}

function normaliza(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function PreguntasBuscador({
  clinics,
  faqs,
}: {
  clinics: Clinic[];
  faqs: (Faq & { clinicName: string })[];
}) {
  const [clinica, setClinica] = useState(TODAS);
  const [busqueda, setBusqueda] = useState("");

  /* El índice se calcula una vez y no en cada tecla. */
  const indexadas = useMemo(
    () => faqs.map((f) => ({ faq: f, buscable: normaliza(f.question + " " + texto(f.answerHtml)) })),
    [faqs],
  );

  const visibles = useMemo(() => {
    const q = normaliza(busqueda.trim());
    return indexadas
      .filter(({ faq }) => clinica === TODAS || faq.clinicSlug === clinica)
      .filter(({ buscable }) => q === "" || buscable.includes(q))
      .map(({ faq }) => faq);
  }, [indexadas, clinica, busqueda]);

  return (
    <>
      <div className="buscador">
        <label className="buscador__campo">
          <span className="etiqueta">Buscar</span>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe una palabra: despido, deudas, SII…"
            autoComplete="off"
          />
        </label>
        <p className="buscador__cuenta" role="status">
          {visibles.length === faqs.length
            ? `${faqs.length} preguntas`
            : `${visibles.length} de ${faqs.length}`}
        </p>
      </div>

      <div className="filtros" role="group" aria-label="Filtrar preguntas por clínica">
        <button
          className="filtro"
          type="button"
          aria-pressed={clinica === TODAS}
          onClick={() => setClinica(TODAS)}
        >
          Todas
        </button>
        {clinics.map((c) => (
          <button
            className="filtro"
            type="button"
            key={c.slug}
            aria-pressed={clinica === c.slug}
            onClick={() => setClinica(c.slug)}
          >
            {c.name.replace(/^Clínica (de )?/, "")}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="galeria__nota galeria__nota--sola">
          Ninguna pregunta coincide con esa búsqueda. Prueba con otra palabra, o escribe tu caso
          en el formulario de ingreso y la clínica correspondiente te responderá.
        </p>
      ) : (
        <div className="faq">
          {visibles.map((faq, i) => (
            <details className="faq__item" data-clinica={faq.clinicSlug} key={faq.id}>
              <summary data-n={String(i + 1).padStart(2, "0")}>
                {faq.question}
                <span className="faq__signo" />
              </summary>
              <div className="faq__respuesta">
                <span className="faq__clinica">{faq.clinicName}</span>
                <div dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}
