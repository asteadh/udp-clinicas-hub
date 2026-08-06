"use client";

import type { Clinic, Faq } from "@hubnegocios/api-client";
import { useState } from "react";

/* Las preguntas de la home se filtran por clínica en el cliente. Son pocas y ya
   vienen todas cargadas, así que filtrar aquí evita un viaje al servidor por
   cada chip. El FAQ completo de cada clínica vive en /clinicas/[slug]. */

const TODAS = "todas";

export function HomeFaq({
  clinics,
  faqs,
  filterAllLabel,
}: {
  clinics: Clinic[];
  faqs: (Faq & { clinicName: string })[];
  filterAllLabel: string;
}) {
  const [activo, setActivo] = useState(TODAS);

  const visibles = activo === TODAS ? faqs : faqs.filter((faq) => faq.clinicSlug === activo);

  return (
    <>
      <div className="filtros" role="group" aria-label="Filtrar preguntas por clínica">
        <button
          className="filtro"
          type="button"
          aria-pressed={activo === TODAS}
          onClick={() => setActivo(TODAS)}
        >
          {filterAllLabel}
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

      <div className="faq">
        {visibles.map((faq, index) => (
          <details className="faq__item" key={faq.id}>
            <summary data-n={String(index + 1).padStart(2, "0")}>
              {faq.question}
              <span className="faq__signo" />
            </summary>
            <div className="faq__respuesta">
              <span className="faq__clinica">{faq.clinicName}</span>
              <div className="hub-prose" dangerouslySetInnerHTML={{ __html: faq.answerHtml }} />
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
