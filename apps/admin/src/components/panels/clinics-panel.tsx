"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { ClinicDialog } from "./clinic-dialog";
import type { AdminPageCopy } from "./shared";

export function ClinicsPanel({
  rows,
  token,
  updateClinic,
  refresh,
  copy,
}: {
  rows: Clinic[];
  token: string;
  updateClinic: (slug: string, body: Record<string, unknown>) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<Clinic | null>(null);

  return (
    <HubCard>
      <h2 className="mb-3">{copy.clinicsPanel.title}</h2>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.clinicsPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.clinicsPanel.name}</th>
                <th>{copy.clinicsPanel.contactEmail}</th>
                <th>{copy.common.status}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.slug}>
                  <td>{row.name}</td>
                  <td>{row.contactEmail}</td>
                  <td>
                    <HubStatusPill tone={row.isActive !== false ? "success" : "neutral"}>
                      {row.isActive !== false ? copy.common.active : copy.common.inactive}
                    </HubStatusPill>
                  </td>
                  <td className="hub-actions">
                    <HubButton type="button" variant="ghost" onClick={() => setDialog(row)}>
                      {copy.common.edit}
                    </HubButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </HubDataTable>
      )}
      {dialog && (
        <ClinicDialog
          clinic={dialog}
          token={token}
          updateClinic={updateClinic}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
