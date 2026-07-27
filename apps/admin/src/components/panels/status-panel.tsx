"use client";

import type { ContactInquiry, JsonRecord } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { InquiryDialog } from "./inquiry-dialog";
import { type AdminPageCopy, formatValue } from "./shared";

const STATUS_TONE = { new: "info", in_progress: "neutral", closed: "success" } as const;

export function StatusPanel({
  rows,
  update,
  refresh,
  copy,
}: {
  rows: ContactInquiry[];
  update: (id: string, body: JsonRecord) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<ContactInquiry | null>(null);

  async function setStatus(id: string, status: string) {
    await update(id, { status });
    refresh();
  }

  if (!rows.length) {
    return <HubEmptyState title={copy.contactPanel.title} description={copy.common.noData} />;
  }

  return (
    <HubCard>
      <h2>{copy.contactPanel.title}</h2>
      <HubDataTable>
        <table className="hub-table">
          <thead>
            <tr>
              <th>{copy.contactPanel.name}</th>
              <th>{copy.contactPanel.email}</th>
              <th>{copy.contactPanel.message}</th>
              <th>{copy.common.status}</th>
              <th>{copy.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.fullName}</td>
                <td>{row.email}</td>
                <td>{formatValue(row.message).slice(0, 80)}</td>
                <td>
                  <HubStatusPill tone={STATUS_TONE[row.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                    {copy.contactPanel.statuses[row.status as keyof typeof copy.contactPanel.statuses] ?? row.status}
                  </HubStatusPill>
                </td>
                <td className="hub-actions">
                  {row.status !== "in_progress" && (
                    <HubButton type="button" variant="ghost" onClick={() => setStatus(row.id, "in_progress")}>
                      {copy.contactPanel.statuses.in_progress}
                    </HubButton>
                  )}
                  {row.status !== "closed" && (
                    <HubButton type="button" onClick={() => setStatus(row.id, "closed")}>
                      {copy.contactPanel.statuses.closed}
                    </HubButton>
                  )}
                  <HubButton type="button" variant="ghost" onClick={() => setDialog(row)}>
                    {copy.common.edit}
                  </HubButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </HubDataTable>
      {dialog && (
        <InquiryDialog
          inquiry={dialog}
          update={update}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
