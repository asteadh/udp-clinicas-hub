"use client";

import type { AdminUser, Clinic } from "@hubnegocios/api-client";
import { HubButton, HubCard, HubDataTable, HubEmptyState, HubStatusPill } from "@hubnegocios/ui";
import { useState } from "react";
import { AdminUserDialog } from "./admin-user-dialog";
import type { AdminPageCopy } from "./shared";

export function AdminUsersPanel({
  rows,
  clinics,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  refresh,
  copy,
}: {
  rows: AdminUser[];
  clinics: Clinic[];
  createAdminUser: (body: Record<string, unknown>) => Promise<unknown>;
  updateAdminUser: (userId: string, body: Record<string, unknown>) => Promise<unknown>;
  deleteAdminUser: (userId: string) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [dialog, setDialog] = useState<AdminUser | "create" | null>(null);

  async function remove(userId: string) {
    if (!window.confirm(copy.common.confirmDelete)) return;
    await deleteAdminUser(userId);
    refresh();
  }

  return (
    <HubCard>
      <div className="hub-actions mb-3 justify-between">
        <h2>{copy.adminUsersPanel.title}</h2>
        <HubButton type="button" onClick={() => setDialog("create")}>
          {copy.adminUsersPanel.newUser}
        </HubButton>
      </div>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.adminUsersPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.adminUsersPanel.email}</th>
                <th>{copy.adminUsersPanel.role}</th>
                <th>{copy.adminUsersPanel.clinic}</th>
                <th>{copy.common.status}</th>
                <th>{copy.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.userId}>
                  <td>{row.email}</td>
                  <td>
                    <HubStatusPill tone="info">{copy.adminUsersPanel.roles[row.role]}</HubStatusPill>
                  </td>
                  <td>{row.clinicSlug ?? copy.common.allClinics}</td>
                  <td>{row.status}</td>
                  <td className="hub-actions">
                    <HubButton type="button" variant="ghost" onClick={() => setDialog(row)}>
                      {copy.common.edit}
                    </HubButton>
                    <HubButton type="button" variant="danger" onClick={() => remove(row.userId)}>
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
        <AdminUserDialog
          adminUser={dialog === "create" ? null : dialog}
          clinics={clinics}
          createAdminUser={createAdminUser}
          updateAdminUser={updateAdminUser}
          onClose={() => setDialog(null)}
          onSaved={refresh}
          copy={copy}
        />
      )}
    </HubCard>
  );
}
