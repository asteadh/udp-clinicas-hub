"use client";

import type { GalleryAlbum } from "@hubnegocios/api-client";
import { HubButton, HubField, HubSwitch, HubTextarea } from "@hubnegocios/ui";
import { useRef, useState } from "react";
import { FormDialog } from "@/components/form-dialog";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "./shared";

export function AlbumDialog({
  album,
  clinicSlug,
  token,
  createAlbum,
  updateAlbum,
  onClose,
  onSaved,
  copy,
}: {
  album: GalleryAlbum | null;
  clinicSlug: string;
  token: string;
  createAlbum: (body: Record<string, unknown>) => Promise<unknown>;
  updateAlbum: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [title, setTitle] = useState(album?.title ?? "");
  const [description, setDescription] = useState(album?.description ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(album?.coverImageUrl ?? "");
  const [isPublished, setIsPublished] = useState(album?.isPublished ?? false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadCover(file: File) {
    setUploadError("");
    setUploading(true);
    try {
      const extension = file.name.split(".").pop() || "jpg";
      const safeName = (title || "album").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const renamed = new File([file], `${safeName}-${Date.now()}.${extension}`, { type: file.type });
      const uploaded = await api.uploadFile(renamed, "gallery", token);
      setCoverImageUrl(uploaded.path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    if (album) {
      await updateAlbum(album.id, { title, description, coverImageUrl, isPublished });
    } else {
      await createAlbum({ clinicSlug, title, description, coverImageUrl });
    }
  }

  const preview = coverImageUrl ? api.storageUrl(coverImageUrl) : "";

  return (
    <FormDialog
      open
      title={album ? copy.galleryPanel.editAlbum : copy.galleryPanel.newAlbum}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={album ? copy.common.save : copy.common.create}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={uploading || !title.trim()}
    >
      <HubField label={copy.galleryPanel.albumTitle} value={title} onChange={(event) => setTitle(event.target.value)} required />
      <label className="hub-field">
        <span>{copy.galleryPanel.description}</span>
        <HubTextarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <div className="grid gap-2">
        <HubField
          label={copy.galleryPanel.coverImage}
          value={coverImageUrl}
          onChange={(event) => setCoverImageUrl(event.target.value)}
          error={uploadError || undefined}
        />
        <div className="flex items-center gap-3">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="size-12 rounded-lg border border-hub-border object-cover" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadCover(file);
              event.target.value = "";
            }}
          />
          <HubButton type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
            {uploading ? copy.common.uploading : copy.common.upload}
          </HubButton>
        </div>
      </div>
      {album && (
        <label className="hub-actions">
          <HubSwitch checked={isPublished} onChange={setIsPublished} label={copy.common.publish} />
          <span>{isPublished ? copy.common.published : copy.common.draft}</span>
        </label>
      )}
    </FormDialog>
  );
}
