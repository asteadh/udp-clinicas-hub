import { readFileSync } from "node:fs";

/* Humo del sitio público: comprueba que cada página siga conectada a su fuente
   de datos y conserve lo que la hace funcionar.
 *
 * Antes verificaba nombres de componentes —ClinicCard, HubLogo, hub-nav— y eso
 * convirtió el test en un registro de la implementación de entonces: rediseñar
 * lo rompía aunque nada dejara de funcionar. Lo que se comprueba aquí es qué
 * datos pide cada página y qué garantías mantiene, no con qué piezas se dibuja.
 */

const fallos = [];

function revisar(nombre, ruta, esperado) {
  const fuente = readFileSync(new URL(ruta, import.meta.url), "utf8");
  for (const [que, aguja] of Object.entries(esperado)) {
    if (!fuente.includes(aguja)) fallos.push(`${nombre}: falta ${que} (${aguja})`);
  }
}

revisar("home", "../src/app/page.tsx", {
  "las clínicas": "api.clinics",
  "el equipo de cada clínica": "clinicTeam",
  "las preguntas": "clinicFaqs",
  "el bloque de ingreso": "IngresoFormulario",
  "la muestra de actividad": "Muro",
  "el paso a la actividad completa": "/actividad",
});

revisar("actividad", "../src/app/actividad/page.tsx", {
  "las columnas": "api.articles",
  "la galería de cada clínica": "clinicGallery",
  "el muro": "Muro",
});

revisar("preguntas", "../src/app/preguntas/page.tsx", {
  "las preguntas de cada clínica": "clinicFaqs",
  "el buscador": "PreguntasBuscador",
});

revisar("cabecera", "../src/components/site-header.tsx", {
  "la navegación": '<nav className="nav"',
  "la sección actual": "aria-current",
  "el selector de tema": "hub-tema",
});

revisar("formulario de contacto", "../src/components/contact-form.tsx", {
  "el envío": "api.contact",
  "que sea de cliente": "use client",
});

revisar("ingreso", "../src/components/ingreso-formulario.tsx", {
  "el formulario de la Facultad": "forms.gle",
  "el código para escanear": "qr-formulario-ingreso.svg",
});

revisar("página de clínica", "../src/app/clinicas/[slug]/page.tsx", {
  "el 404 cuando no existe": "notFound",
  "su galería": "clinicGallery",
  "su equipo": "clinicTeam",
});

revisar("página de columna", "../src/app/articulos/[slug]/page.tsx", {
  "el 404 cuando no existe": "notFound",
  "el cuerpo del artículo": "bodyHtml",
  "los estilos del contenido del panel": "hub-prose",
});

if (fallos.length) {
  console.error(fallos.join("\n"));
  throw new Error(`web smoke failed (${fallos.length})`);
}

console.log("web smoke ok");
