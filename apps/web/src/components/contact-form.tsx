"use client";

import type { Clinic } from "@hubnegocios/api-client";
import { HubAlert, HubButton, HubField, HubSelect, HubTextarea } from "@hubnegocios/ui";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import type { WebPageCopy } from "@/lib/copy";

export function ContactForm({
  clinics,
  copy,
  defaultClinicSlug,
}: {
  clinics: Clinic[];
  copy: WebPageCopy;
  defaultClinicSlug?: string;
}) {
  const [clinicSlug, setClinicSlug] = useState(defaultClinicSlug ?? clinics[0]?.slug ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.contact({ clinicSlug, name, email, phone: phone || undefined, message });
      setSent(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return <HubAlert className="hub-alert--success">{copy.contact.success}</HubAlert>;
  }

  return (
    <form className="grid gap-3" onSubmit={submit}>
      {error && <HubAlert className="hub-alert--danger">{copy.contact.error}</HubAlert>}
      <label className="hub-field">
        <span>{copy.contact.clinic}</span>
        <HubSelect value={clinicSlug} onChange={(event) => setClinicSlug(event.target.value)} required>
          {clinics.map((clinic) => (
            <option key={clinic.slug} value={clinic.slug}>
              {clinic.name}
            </option>
          ))}
        </HubSelect>
      </label>
      <HubField label={copy.contact.name} value={name} onChange={(event) => setName(event.target.value)} required />
      <HubField label={copy.contact.email} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <HubField label={copy.contact.phone} value={phone} onChange={(event) => setPhone(event.target.value)} />
      <label className="hub-field">
        <span>{copy.contact.message}</span>
        <HubTextarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} required />
      </label>
      <HubButton type="submit" disabled={busy || !clinicSlug || !name.trim() || !email.trim() || !message.trim()}>
        {busy ? copy.contact.sending : copy.contact.submit}
      </HubButton>
    </form>
  );
}
