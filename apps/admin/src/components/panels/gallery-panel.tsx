"use client";

import type { GalleryAlbum } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { Fragment, useState } from "react";
import { AlbumDialog } from "./album-dialog";
import { AlbumPhotos } from "./album-photos";
import type { AdminPageCopy } from "./shared";

export function GalleryPanel({
  rows,
  clinicSlug,
  token,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhoto,
  updatePhoto,
  deletePhoto,
  refresh,
  copy,
}: {
  rows: GalleryAlbum[];
  clinicSlug: string;
  token: string;
  createAlbum: (body: Record<string, unknown>) => Promise<unknown>;
  updateAlbum: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deleteAlbum: (id: string) => Promise<unknown>;
  addPhoto: (albumId: string, body: Record<string, unknown>) => Promise<unknown>;
  updatePhoto: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deletePhoto: (id: string) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<GalleryAlbum | "create" | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deleteAlbum(id);
    refresh();
  }

  return (
    <HubCard>
      <div className="hub-actions mb-3 justify-between">
        <h2>{copy.galleryPanel.title}</h2>
        <HubButton type="button" onClick={() => setDialog("create")}>
          {copy.galleryPanel.newAlbum}
        </HubButton>
      </div>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.galleryPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.galleryPanel.albumTitle}</th>
                <th>{copy.galleryPanel.photos}</th>
                <th>{copy.common.status}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <Fragment key={row.id}>
                  <tr>
                    <td>{row.title}</td>
                    <td>{row.photos?.length ?? 0}</td>
                    <td>
                      <HubStatusPill tone={row.isPublished ? "success" : "neutral"}>
                        {row.isPublished ? copy.common.published : copy.common.draft}
                      </HubStatusPill>
                    </td>
                    <td className="hub-actions">
                      <HubButton type="button" variant="ghost" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                        {copy.galleryPanel.photos}
                      </HubButton>
                      <HubButton type="button" variant="ghost" onClick={() => setDialog(row)}>
                        {copy.common.edit}
                      </HubButton>
                      <HubButton type="button" variant="danger" onClick={() => remove(row.id)}>
                        {copy.common.delete}
                      </HubButton>
                    </td>
                  </tr>
                  {expanded === row.id && (
                    <tr>
                      <td colSpan={4}>
                        <AlbumPhotos
                          album={row}
                          token={token}
                          addPhoto={(body) => addPhoto(row.id, body)}
                          updatePhoto={updatePhoto}
                          deletePhoto={deletePhoto}
                          refresh={refresh}
                          copy={copy}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </HubDataTable>
      )}
      {dialog && (
        <AlbumDialog
          album={dialog === "create" ? null : dialog}
          clinicSlug={clinicSlug}
          token={token}
          createAlbum={createAlbum}
          updateAlbum={updateAlbum}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
