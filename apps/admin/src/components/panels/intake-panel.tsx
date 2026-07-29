"use client";

import type { IntakeRequest, JsonRecord } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { IntakeDialog } from "./intake-dialog";
import { type AdminPageCopy, formatValue } from "./shared";

const STATUS_TONE = {
  new: "info",
  in_review: "neutral",
  accepted: "success",
  rejected: "danger",
  closed: "neutral",
} as const;

export function IntakePanel({
  rows,
  update,
  refresh,
  copy,
}: {
  rows: IntakeRequest[];
  update: (id: string, body: JsonRecord) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<IntakeRequest | null>(null);

  async function setStatus(id: string, status: string) {
    await update(id, { status });
    refresh();
  }

  if (!rows.length) {
    return <HubEmptyState title={copy.intakePanel.title} description={copy.common.noData} />;
  }

  return (
    <HubCard>
      <h2>{copy.intakePanel.title}</h2>
      <HubDataTable>
        <table className="hub-table">
          <thead>
            <tr>
              <th>{copy.intakePanel.fullName}</th>
              <th>{copy.intakePanel.rut}</th>
              <th>{copy.intakePanel.email}</th>
              <th>{copy.intakePanel.caseDescription}</th>
              <th>{copy.common.status}</th>
              <th>{copy.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.fullName}</td>
                <td>{row.rut}</td>
                <td>{row.email}</td>
                <td>{formatValue(row.caseDescription).slice(0, 80)}</td>
                <td>
                  <HubStatusPill tone={STATUS_TONE[row.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                    {copy.intakePanel.statuses[row.status as keyof typeof copy.intakePanel.statuses] ?? row.status}
                  </HubStatusPill>
                </td>
                <td className="hub-actions">
                  {row.status !== "accepted" && (
                    <HubButton type="button" variant="ghost" onClick={() => setStatus(row.id, "accepted")}>
                      {copy.intakePanel.statuses.accepted}
                    </HubButton>
                  )}
                  {row.status !== "closed" && (
                    <HubButton type="button" onClick={() => setStatus(row.id, "closed")}>
                      {copy.intakePanel.statuses.closed}
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
        <IntakeDialog
          request={dialog}
          update={update}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
