import type { GalleryAlbum } from "@hubnegocios/api-client";
import { api } from "@/lib/api";

export function GalleryGrid({ albums }: { albums: GalleryAlbum[] }) {
  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      {albums.map((album) => (
        <div key={album.id}>
          <h3>{album.title}</h3>
          {album.description && <p style={{ color: "var(--hub-muted)" }}>{album.description}</p>}
          <div className="hub-grid" style={{ marginTop: "0.75rem" }}>
            {(album.photos ?? []).map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={photo.id}
                src={api.storageUrl(photo.imageUrl)}
                alt={photo.caption ?? ""}
                style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", borderRadius: "0.75rem" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
