"use client";

import type { Principal } from "@hubnegocios/api-client";
import { HubAlert } from "@hubnegocios/ui";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "@/lib/copy";
import { SecuritySection } from "./security-section";

export type Identities = Awaited<ReturnType<typeof api.identities>>;

// "Mi cuenta": profile + sign-in methods for the logged-in admin. Identities
// are fetched once here and shared with SecuritySection. No password card —
// Hub Negocios has no password-based account flow (only break-glass login).
export function AccountPanel({
  token,
  principal,
  copy,
}: {
  token: string;
  principal: Principal;
  copy: AdminPageCopy;
}) {
  const [identities, setIdentities] = useState<Identities | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setIdentities(await api.identities(token));
    } catch {
      setError(copy.account.loadError);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const email = principal.email || identities?.email || "";
  const name = email ? (email.split("@")[0] ?? "").replace(/[._-]+/g, " ") : "Admin";
  const permissions = principal.permissions ?? [];
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  return (
    <div className="grid max-w-2xl gap-4">
      <h2 className="m-0 text-lg font-extrabold text-hub-ink">{copy.account.title}</h2>

      {error && <HubAlert className="hub-alert--danger">{error}</HubAlert>}

      <section className="rounded-xl border border-hub-border bg-hub-surface p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-hub-honey/50 text-base font-extrabold text-hub-gold-deep">
            {initials}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[15px] font-extrabold capitalize text-hub-ink">{name}</div>
            <div className="truncate text-[13px] text-hub-muted">{email}</div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-hub-muted">{copy.account.role}</span>
          <span className="hub-pill hub-pill--info capitalize">{copy.adminUsersPanel.roles[principal.role]}</span>
          {principal.clinicSlug && (
            <span className="hub-pill capitalize">{principal.clinicSlug}</span>
          )}
          <span className="ml-2 text-xs font-semibold text-hub-muted">{copy.account.permissions}</span>
          {permissions.length === 0 || permissions.includes("*") ? (
            <span className="hub-pill hub-pill--success">{copy.account.allPermissions}</span>
          ) : (
            permissions.map((permission) => (
              <span key={permission} className="hub-pill">
                {permission}
              </span>
            ))
          )}
        </div>
      </section>

      <SecuritySection token={token} identities={identities} reload={load} copy={copy} />
    </div>
  );
}
