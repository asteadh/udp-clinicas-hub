"use client";

import type { GalleryAlbum } from "@hubnegocios/api-client";
import { HubButton, HubField } from "@hubnegocios/ui";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "./shared";

export function AlbumPhotos({
  album,
  token,
  addPhoto,
  updatePhoto,
  deletePhoto,
  refresh,
  copy,
}: {
  album: GalleryAlbum;
  token: string;
  addPhoto: (body: Record<string, unknown>) => Promise<unknown>;
  updatePhoto: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deletePhoto: (id: string) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const photos = album.photos ?? [];

  function captionFor(id: string, fallback: string) {
    return captions[id] ?? fallback;
  }

  async function uploadPhoto(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const renamed = new File([file], `${album.id}-${Date.now()}.${extension}`, { type: file.type });
      const uploaded = await api.uploadFile(renamed, "gallery", token);
      await addPhoto({ imageUrl: uploaded.path, caption: "" });
      refresh();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function saveCaption(id: string) {
    await updatePhoto(id, { caption: captions[id] ?? "" });
    refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deletePhoto(id);
    refresh();
  }

  return (
    <div className="hub-card grid gap-3">
      {uploadError && <p className="hub-field__error">{uploadError}</p>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="grid gap-2 rounded-lg border border-hub-border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={api.storageUrl(photo.imageUrl)} alt="" className="h-32 w-full rounded-md object-cover" />
            <HubField
              label={copy.galleryPanel.caption}
              labelHidden
              value={captionFor(photo.id, photo.caption ?? "")}
              onChange={(event) => setCaptions((prev) => ({ ...prev, [photo.id]: event.target.value }))}
              onBlur={() => saveCaption(photo.id)}
            />
            <HubButton type="button" variant="danger" size="sm" onClick={() => remove(photo.id)}>
              {copy.common.delete}
            </HubButton>
          </div>
        ))}
      </div>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadPhoto(file);
            event.target.value = "";
          }}
        />
        <HubButton type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? copy.common.uploading : copy.galleryPanel.addPhoto}
        </HubButton>
      </div>
    </div>
  );
}
