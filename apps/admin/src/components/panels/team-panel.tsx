"use client";

import type { TeamMember } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { TeamDialog } from "./team-dialog";
import type { AdminPageCopy } from "./shared";

export function TeamPanel({
  rows,
  clinicSlug,
  token,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  refresh,
  copy,
}: {
  rows: TeamMember[];
  clinicSlug: string;
  token: string;
  createTeamMember: (body: Record<string, unknown>) => Promise<unknown>;
  updateTeamMember: (id: string, body: Record<string, unknown>) => Promise<unknown>;
  deleteTeamMember: (id: string) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<TeamMember | "create" | null>(null);

  async function remove(id: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deleteTeamMember(id);
    refresh();
  }

  return (
    <HubCard>
      <div className="hub-actions mb-3 justify-between">
        <h2>{copy.teamPanel.title}</h2>
        <HubButton type="button" onClick={() => setDialog("create")}>
          {copy.teamPanel.newMember}
        </HubButton>
      </div>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.teamPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.teamPanel.fullName}</th>
                <th>{copy.teamPanel.roleTitle}</th>
                <th>{copy.common.status}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.fullName}</td>
                  <td>{row.roleTitle}</td>
                  <td>
                    <HubStatusPill tone={row.isPublished ? "success" : "neutral"}>
                      {row.isPublished ? copy.common.published : copy.common.draft}
                    </HubStatusPill>
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
        <TeamDialog
          member={dialog === "create" ? null : dialog}
          clinicSlug={clinicSlug}
          token={token}
          createTeamMember={createTeamMember}
          updateTeamMember={updateTeamMember}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
