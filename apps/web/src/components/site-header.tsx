"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NombreSitio } from "@/components/logo-udp";
import type { WebPageCopy } from "@/lib/copy";

/* Cabecera de la pieza de diseño, reproducida tal cual: filete institucional,
   marca tipográfica, navegación plana, ciclo de tema en tres estados y menú
   móvil. El marcado y las clases son los de index.html. */

type Tema = "sistema" | "claro" | "oscuro";

const CICLO: Tema[] = ["sistema", "claro", "oscuro"];

const ROTULO: Record<Tema, string> = {
  sistema: "Tema: seguir el sistema. Cambiar a claro.",
  claro: "Tema: claro. Cambiar a oscuro.",
  oscuro: "Tema: oscuro. Seguir el sistema.",
};

/* Claro por defecto: el oscuro es una opción que se elige, no el modo en que
   se abre el sitio por venir de un sistema operativo en oscuro. */
function leerTema(): Tema {
  try {
    const v = window.localStorage.getItem("hub-tema") as Tema | null;
    return v && CICLO.includes(v) ? v : "claro";
  } catch {
    return "claro";
  }
}

export function SiteHeader({ copy }: { copy: WebPageCopy }) {
  const [tema, setTema] = useState<Tema>("claro");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cabecera = useRef<HTMLElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTema(leerTema());
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    if (tema === "sistema") raiz.removeAttribute("data-theme");
    else raiz.setAttribute("data-theme", tema === "oscuro" ? "dark" : "light");
    try {
      window.localStorage.setItem("hub-tema", tema);
    } catch {}
  }, [tema]);

  useEffect(() => {
    if (!menuAbierto) return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAbierto(false);
        boton.current?.focus();
      }
    };
    const alClicar = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".cabecera")) setMenuAbierto(false);
    };
    const consulta = window.matchMedia("(min-width:901px)");
    const alCambiar = () => consulta.matches && setMenuAbierto(false);
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("click", alClicar);
    consulta.addEventListener("change", alCambiar);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("click", alClicar);
      consulta.removeEventListener("change", alCambiar);
    };
  }, [menuAbierto]);

  const glifo = (nombre: Tema) =>
    `icono__glifo icono__glifo--${nombre}${tema === nombre ? " icono__glifo--activo" : ""}`;

  return (
    <>
      <a href="#contenido" className="salto">
        Saltar al contenido
      </a>
      <div className="filete" />

      <header className="cabecera" ref={cabecera} data-menu={menuAbierto ? "abierto" : undefined}>
        <div className="envoltura cabecera__interior">
          <Link href="/" className="marca">
            <NombreSitio className="marca__nombre" />
            <span className="marca__unidad">
              Facultad de Derecho
              <br />
              Universidad Diego Portales
            </span>
          </Link>

          <div className="controles">
            <nav className="nav" id="menu" aria-label="Principal" onClick={() => setMenuAbierto(false)}>
              <Link href="/clinicas">Clínicas</Link>
              <Link href="/#equipo">Equipo</Link>
              <Link href="/actividad">Actividad</Link>
              <Link href="/ingreso" className="nav--destacado">
                Formulario de ingreso
              </Link>
              <Link href="/#preguntas">Preguntas</Link>
            </nav>

            <div className="iconos">
              <button
                className="icono"
                type="button"
                id="tema"
                aria-label={ROTULO[tema]}
                onClick={() => setTema(CICLO[(CICLO.indexOf(tema) + 1) % CICLO.length])}
              >
                <svg className={glifo("sistema")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.25" />
                  <path d="M12 3.75v16.5" />
                  <path d="M12 20.25a8.25 8.25 0 0 0 0-16.5" fill="currentColor" stroke="none" />
                </svg>
                <svg className={glifo("claro")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="12" r="4.6" />
                  <path
                    d="M12 2v2.6M12 19.4V22M2 12h2.6M19.4 12H22M4.9 4.9l1.9 1.9M17.2 17.2l1.9 1.9M19.1 4.9l-1.9 1.9M6.8 17.2l-1.9 1.9"
                    strokeLinecap="round"
                  />
                </svg>
                <svg className={glifo("oscuro")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M20.5 14.4A8.7 8.7 0 0 1 9.6 3.5a8.75 8.75 0 1 0 10.9 10.9Z" strokeLinejoin="round" />
                </svg>
              </button>

              <button
                className="icono hamburguesa"
                type="button"
                id="hamburguesa"
                ref={boton}
                aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuAbierto}
                aria-controls="menu"
                onClick={() => setMenuAbierto((v) => !v)}
              >
                <span />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
