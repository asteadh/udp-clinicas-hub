"use client";

import type { Article } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { ArticleDialog } from "./article-dialog";
import type { AdminPageCopy } from "./shared";

export function ArticlesPanel({
  rows,
  clinicSlug,
  token,
  getArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  refresh,
  copy,
}: {
  rows: Article[];
  clinicSlug: string;
  token: string;
  getArticle: (id: string) => Promise<Article>;
  createArticle: (body: Record<string, unknown>) => Promise<unknown>;
  updateArticle: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deleteArticle: (id: string) => Promise<unknown>;
  publishArticle: (id: string) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<Article | "create" | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function edit(row: Article) {
    setLoadingId(row.id);
    try {
      const full = await getArticle(row.id);
      setDialog(full);
    } finally {
      setLoadingId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deleteArticle(id);
    refresh();
  }

  async function publish(id: string) {
    await publishArticle(id);
    refresh();
  }

  return (
    <HubCard>
      <div className="hub-actions mb-3 justify-between">
        <h2>{copy.articlesPanel.title}</h2>
        <HubButton type="button" onClick={() => setDialog("create")}>
          {copy.articlesPanel.newArticle}
        </HubButton>
      </div>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.articlesPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.articlesPanel.articleTitle}</th>
                <th>{copy.articlesPanel.author}</th>
                <th>{copy.common.status}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.authorName}</td>
                  <td>
                    <HubStatusPill tone={row.isPublished ? "success" : "neutral"}>
                      {row.isPublished ? copy.common.published : copy.common.draft}
                    </HubStatusPill>
                  </td>
                  <td className="hub-actions">
                    {!row.isPublished && (
                      <HubButton type="button" variant="ghost" onClick={() => publish(row.id)}>
                        {copy.common.publish}
                      </HubButton>
                    )}
                    <HubButton type="button" variant="ghost" disabled={loadingId === row.id} onClick={() => edit(row)}>
                      {copy.common.edit}
                    </HubButton>
                    <HubButton type="button" variant="danger" onClick={() => remove(row.id)}>
                      {copy.common.delete}
                    </HubButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </HubDataTable>
      )}
      {dialog && (
        <ArticleDialog
          article={dialog === "create" ? null : dialog}
          clinicSlug={clinicSlug}
          token={token}
          createArticle={createArticle}
          updateArticle={updateArticle}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
