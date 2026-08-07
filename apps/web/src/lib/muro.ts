import type { Clinic, GalleryAlbum, GalleryPhoto } from "@hubnegocios/api-client";
import { api } from "./api";

/* Preparación del muro. Vive fuera del componente porque éste es de cliente, y
   una función exportada desde un archivo "use client" no se puede invocar desde
   el servidor.

   Aquí se resuelve también la URL de cada imagen, para que al componente lleguen
   cadenas y no una función: las funciones no cruzan la frontera servidor-cliente. */

export type FotoMuro = Pick<GalleryPhoto, "id" | "caption"> & {
  src: string;
  clinicSlug: string;
  clinicName: string;
  albumTitle: string;
  createdAt?: string;
};

/** Aplana los álbumes de todas las clínicas en un solo flujo, lo más reciente
 *  primero. Los álbumes siguen agrupando en el panel; en el muro son solo una
 *  etiqueta sobre cada fotografía. */
export function aplanarMuro(clinics: Clinic[], galerias: GalleryAlbum[][]): FotoMuro[] {
  const fotos: FotoMuro[] = galerias.flatMap((albumes, i) =>
    albumes.flatMap((album) =>
      (album.photos ?? []).map((foto) => ({
        id: foto.id,
        caption: foto.caption,
        src: api.storageUrl(foto.imageUrl),
        clinicSlug: clinics[i]?.slug ?? album.clinicSlug,
        clinicName: clinics[i]?.name ?? album.clinicSlug,
        albumTitle: album.title,
        createdAt: foto.createdAt,
      })),
    ),
  );

  return fotos.sort((a, b) => {
    const fa = a.createdAt ? Date.parse(a.createdAt) : 0;
    const fb = b.createdAt ? Date.parse(b.createdAt) : 0;
    return fb - fa;
  });
}
