import type { Clinic } from "@hubnegocios/api-client";
import { HubSelect } from "@hubnegocios/ui";
import type { AdminPageCopy } from "./shared";

// Superadmin-only: clinic-scoped tabs (faqs/articles/gallery/team) need a
// clinic to query against. A clinic_admin has no equivalent control — their
// requests are always scoped server-side to their own clinicSlug.
export function ClinicSwitcher({
  clinics,
  value,
  onChange,
  copy,
}: {
  clinics: Clinic[];
  value: string;
  onChange: (slug: string) => void;
  copy: AdminPageCopy;
}) {
  if (clinics.length === 0) return null;
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-hub-muted">
      {copy.common.clinic}
      <HubSelect value={value} onChange={(event) => onChange(event.target.value)}>
        {clinics.map((clinic) => (
          <option key={clinic.slug} value={clinic.slug}>
            {clinic.name}
          </option>
        ))}
      </HubSelect>
    </label>
  );
}
