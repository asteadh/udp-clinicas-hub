"use client";

import type { AdminRole, AdminUser, Clinic } from "@hubnegocios/api-client";
import { HubField, HubSelect } from "@hubnegocios/ui";
import { useState } from "react";
import { FormDialog, FormRow } from "@/components/form-dialog";
import type { AdminPageCopy } from "./shared";

export function AdminUserDialog({
  adminUser,
  clinics,
  createAdminUser,
  updateAdminUser,
  onClose,
  onSaved,
  copy,
}: {
  adminUser: AdminUser | null;
  clinics: Clinic[];
  createAdminUser: (body: Record<string, unknown>) => Promise<unknown>;
  updateAdminUser: (userId: string, body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [email, setEmail] = useState(adminUser?.email ?? "");
  const [firstName, setFirstName] = useState(adminUser?.firstName ?? "");
  const [lastName, setLastName] = useState(adminUser?.lastName ?? "");
  const [role, setRole] = useState<AdminRole>(adminUser?.role ?? "clinic_admin");
  const [clinicSlug, setClinicSlug] = useState(adminUser?.clinicSlug ?? clinics[0]?.slug ?? "");

  async function submit() {
    const body = { role, clinicSlug: role === "superadmin" ? "" : clinicSlug, permissions: adminUser?.permissions ?? [] };
    if (adminUser) {
      await updateAdminUser(adminUser.userId, body);
    } else {
      await createAdminUser({ email, firstName, lastName, ...body });
    }
  }

  return (
    <FormDialog
      open
      title={adminUser ? copy.adminUsersPanel.editUser : copy.adminUsersPanel.newUser}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={adminUser ? copy.common.save : copy.common.create}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      submitDisabled={!adminUser && !email.trim()}
    >
      {!adminUser && (
        <>
          <HubField label={copy.adminUsersPanel.email} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <FormRow>
            <HubField label={copy.adminUsersPanel.firstName} value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            <HubField label={copy.adminUsersPanel.lastName} value={lastName} onChange={(event) => setLastName(event.target.value)} />
          </FormRow>
        </>
      )}
      <label className="hub-field">
        <span>{copy.adminUsersPanel.role}</span>
        <HubSelect value={role} onChange={(event) => setRole(event.target.value as AdminRole)}>
          <option value="superadmin">{copy.adminUsersPanel.roles.superadmin}</option>
          <option value="clinic_admin">{copy.adminUsersPanel.roles.clinic_admin}</option>
        </HubSelect>
      </label>
      {role === "clinic_admin" && (
        <label className="hub-field">
          <span>{copy.adminUsersPanel.clinic}</span>
          <HubSelect value={clinicSlug} onChange={(event) => setClinicSlug(event.target.value)}>
            {clinics.map((clinic) => (
              <option key={clinic.slug} value={clinic.slug}>
                {clinic.name}
              </option>
            ))}
          </HubSelect>
        </label>
      )}
    </FormDialog>
  );
}
