import { redirect } from "next/navigation";

/* El listado de columnas se fundió con la galería en /actividad. Esta ruta se
   conserva redirigiendo para no romper enlaces ya publicados; cada columna
   sigue viviendo en /articulos/[slug]. */
export default function ArticulosPage() {
  redirect("/actividad");
}
