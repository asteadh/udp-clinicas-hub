import { HubApiClient } from "@hubnegocios/api-client";

/* El cliente compartido fuerza `cache: "no-store"` en cada petición. Para el
   panel es lo correcto —un administrador tiene que ver su cambio al instante—
   pero en el sitio público significa que cada visita vuelve a pedirlo todo.
   La home hace catorce llamadas (clínicas, columnas, y equipo, galería y
   preguntas por cada una de las cuatro clínicas), así que sin caché son catorce
   viajes al API por visitante.

   Aquí se sustituye por revalidación en el tiempo: las lecturas se sirven desde
   la caché de Next y se refrescan una vez por minuto. Con cien visitas en un
   minuto se pasa de mil cuatrocientas llamadas a catorce.

   Las escrituras (el formulario de ingreso, el de contacto) van por el fetch
   normal, sin caché. */

export const REVALIDAR_SEGUNDOS = 60;

const fetcherConCache: typeof fetch = (input, init) => {
  const metodo = (init?.method ?? "GET").toUpperCase();
  if (metodo !== "GET") return fetch(input, init);

  // Se descarta el "no-store" del cliente compartido para que Next pueda cachear.
  const { cache: _sinUsar, ...resto } = init ?? {};
  return fetch(input, { ...resto, next: { revalidate: REVALIDAR_SEGUNDOS } });
};

export const api = new HubApiClient({
  baseUrl: process.env.NEXT_PUBLIC_HUBNEGOCIOS_API_URL ?? "http://localhost:4000",
  fetcher: fetcherConCache,
});
