"use client";

import type { Faq } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { FaqDialog } from "./faq-dialog";
import type { AdminPageCopy } from "./shared";

export function FaqsPanel({
  rows,
  clinicSlug,
  createFaq,
  updateFaq,
  deleteFaq,
  reorderFaqs,
  refresh,
  copy,
}: {
  rows: Faq[];
  clinicSlug: string;
  createFaq: (body: Record<string, unknown>) => Promise<unknown>;
  updateFaq: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deleteFaq: (id: string) => Promise<unknown>;
  reorderFaqs: (orderedIds: string[]) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<Faq | "create" | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;
    const orderedIds = rows.map((row) => row.id);
    [orderedIds[index], orderedIds[target]] = [orderedIds[target], orderedIds[index]];
    await reorderFaqs(orderedIds);
    refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deleteFaq(id);
    refresh();
  }

  return (
    <HubCard>
      <div className="hub-actions mb-3 justify-between">
        <h2>{copy.faqsPanel.title}</h2>
        <HubButton type="button" onClick={() => setDialog("create")}>
          {copy.faqsPanel.newFaq}
        </HubButton>
      </div>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.faqsPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.faqsPanel.question}</th>
                <th>{copy.common.status}</th>
                <th>{copy.faqsPanel.order}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id}>
                  <td>{row.question}</td>
                  <td>
                    <HubStatusPill tone={row.isPublished ? "success" : "neutral"}>
                      {row.isPublished ? copy.common.published : copy.common.draft}
                    </HubStatusPill>
                  </td>
                  <td className="hub-actions">
                    <HubButton type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, -1)}>
                      ↑
                    </HubButton>
                    <HubButton type="button" variant="ghost" size="sm" disabled={index === rows.length - 1} onClick={() => move(index, 1)}>
                      ↓
                    </HubButton>
                  </td>
                  <td className="hub-actions">
                    <HubButton type="button" variant="ghost" onClick={() => setDialog(row)}>
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
        <FaqDialog
          faq={dialog === "create" ? null : dialog}
          clinicSlug={clinicSlug}
          createFaq={createFaq}
          updateFaq={updateFaq}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
