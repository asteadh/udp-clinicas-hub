"use client";

import type { Clinic, Faq } from "@hubnegocios/api-client";
import { useState } from "react";

/* Preguntas frecuentes con el marcado de la pieza de diseño: chips de filtro y
   acordeón con numeración. Se filtra en el cliente porque son pocas y ya vienen
   todas cargadas. El FAQ completo de cada clínica vive en /clinicas/[slug]. */

const TODAS = "todas";

export function HomeFaq({
  clinics,
  faqs,
}: {
  clinics: Clinic[];
  faqs: (Faq & { clinicName: string })[];
}) {
  const [activo, setActivo] = useState(TODAS);
  const visibles = activo === TODAS ? faqs : faqs.filter((f) => f.clinicSlug === activo);

  return (
    <>
      <div className="filtros" role="group" aria-label="Filtrar preguntas por clínica">
        <button
          className="filtro"
          type="button"
          aria-pressed={activo === TODAS}
          onClick={() => setActivo(TODAS)}
        >
          Todas
        </button>
        {clinics.map((clinic) => (
          <button
            className="filtro"
            type="button"
            key={clinic.slug}
            aria-pressed={activo === clinic.slug}
            onClick={() => setActivo(clinic.slug)}
          >
            {clinic.name.replace(/^Clínica (de )?/, "")}
          </button>
        ))}
      </div>

      <div className="faq" id="listaFaq">
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
    </>
  );
}
