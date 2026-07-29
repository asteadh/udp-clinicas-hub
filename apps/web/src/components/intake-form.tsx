"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { HubAlert, HubButton, HubField, HubSelect, HubTextarea } from "@hubnegocios/ui";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

export function IntakeForm({
  clinics,
  copy,
  defaultClinicSlug,
}: {
  clinics: Clinic[];
  copy: WebPageCopy;
  defaultClinicSlug?: string;
}) {
  const [clinicSlug, setClinicSlug] = useState(defaultClinicSlug ?? clinics[0]?.slug ?? "");
  const [fullName, setFullName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [caseType, setCaseType] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [hasDocumentation, setHasDocumentation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.intake({
        clinicSlug,
        fullName,
        rut,
        email,
        phone: phone || undefined,
        caseType: caseType || undefined,
        caseDescription,
        hasDocumentation: hasDocumentation || undefined,
      });
      setSent(true);
      setFullName("");
      setRut("");
      setEmail("");
      setPhone("");
      setCaseType("");
      setCaseDescription("");
      setHasDocumentation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return <HubAlert className="hub-alert--success">{copy.intake.success}</HubAlert>;
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      {error && <HubAlert className="hub-alert--danger">{copy.intake.error}</HubAlert>}
      <label className="hub-field">
        <span>{copy.intake.clinic}</span>
        <HubSelect value={clinicSlug} onChange={(event) => setClinicSlug(event.target.value)} required>
          {clinics.map((clinic) => (
            <option key={clinic.slug} value={clinic.slug}>
              {clinic.name}
            </option>
          ))}
        </HubSelect>
      </label>
      <HubField label={copy.intake.fullName} value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      <HubField label={copy.intake.rut} value={rut} onChange={(event) => setRut(event.target.value)} required />
      <HubField label={copy.intake.email} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <HubField label={copy.intake.phone} value={phone} onChange={(event) => setPhone(event.target.value)} />
      <HubField
        label={copy.intake.caseType}
        placeholder={copy.intake.caseTypePlaceholder}
        value={caseType}
        onChange={(event) => setCaseType(event.target.value)}
      />
      <label className="hub-field">
        <span>{copy.intake.caseDescription}</span>
        <HubTextarea rows={5} value={caseDescription} onChange={(event) => setCaseDescription(event.target.value)} required />
      </label>
      <label className="hub-field">
        <span>{copy.intake.hasDocumentation}</span>
        <HubTextarea
          rows={3}
          placeholder={copy.intake.hasDocumentationPlaceholder}
          value={hasDocumentation}
          onChange={(event) => setHasDocumentation(event.target.value)}
        />
      </label>
      <HubButton
        type="submit"
        disabled={busy || !clinicSlug || !fullName.trim() || !rut.trim() || !email.trim() || !caseDescription.trim()}
      >
        {busy ? copy.intake.sending : copy.intake.submit}
      </HubButton>
    </form>
  );
}
