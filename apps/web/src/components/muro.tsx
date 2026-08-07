"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { useState } from "react";
import type { FotoMuro } from "@/lib/muro";

/* Muro de actividades: en vez de portadas de álbum, un flujo de fotografías
   ordenado por fecha de subida, lo más reciente primero. El profesor sube desde
   el panel y aparece aquí sin pasos intermedios.

   Los álbumes siguen existiendo en la base y en el panel —son la forma de
   agrupar y de titular una actividad— pero en el sitio público pasan a ser una
   etiqueta sobre cada foto, no una carpeta que haya que abrir. */

const TODAS = "todas";

/* Cada tercera pieza va en marco vertical: rompe la cuadrícula uniforme, que es
   lo que hace que una galería parezca plantilla. */
function esAlta(i: number) {
  return i % 3 === 2;
}

export function Muro({
  clinics,
  fotos,
  dateLocale,
}: {
  clinics: Clinic[];
  fotos: FotoMuro[];
  dateLocale: string;
}) {
  const [activa, setActiva] = useState(TODAS);

  if (fotos.length === 0) {
    return (
      <p className="galeria__nota galeria__nota--sola">
        Todavía no hay fotografías publicadas. Cada clínica sube las suyas desde su panel de
        administración y aparecen aquí automáticamente, de lo más reciente a lo más antiguo.
      </p>
    );
  }

  const visibles = activa === TODAS ? fotos : fotos.filter((f) => f.clinicSlug === activa);

  const fecha = (valor?: string) =>
    valor
      ? new Date(valor).toLocaleDateString(dateLocale, {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : null;

  return (
    <>
      <div className="filtros" role="group" aria-label="Filtrar fotografías por clínica">
        <button
          className="filtro"
          type="button"
          aria-pressed={activa === TODAS}
          onClick={() => setActiva(TODAS)}
        >
          Todas
        </button>
        {clinics.map((clinic) => (
          <button
            className="filtro"
            type="button"
            key={clinic.slug}
            aria-pressed={activa === clinic.slug}
            onClick={() => setActiva(clinic.slug)}
          >
            {clinic.name.replace(/^Clínica (de )?/, "")}
          </button>
        ))}
      </div>

      <div className="muro">
        {visibles.map((foto, i) => (
          <figure className="muro__pieza" key={foto.id}>
            <div className={`marco${esAlta(i) ? " marco--alto" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={foto.src} alt={foto.caption || ""} loading="lazy" />
            </div>
            <figcaption className="muro__pie">
              <span className="muro__clinica">{foto.clinicName}</span>
              {foto.caption && <p className="muro__texto">{foto.caption}</p>}
              <span className="muro__meta">
                {foto.albumTitle}
                {fecha(foto.createdAt) ? ` · ${fecha(foto.createdAt)}` : ""}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
