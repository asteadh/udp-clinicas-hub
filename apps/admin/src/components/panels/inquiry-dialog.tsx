"use client";

import type { ContactInquiry, JsonRecord } from "@hubnegocios/api-client";
import { HubField, HubSelect, HubTextarea } from "@hubnegocios/ui";
import { useState } from "react";
import { FormDialog } from "@/components/form-dialog";
import type { AdminPageCopy } from "./shared";

export function InquiryDialog({
  inquiry,
  update,
  onClose,
  onSaved,
  copy,
}: {
  inquiry: ContactInquiry;
  update: (id: string, body: JsonRecord) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [status, setStatus] = useState(inquiry.status);
  const [internalNotes, setInternalNotes] = useState(inquiry.internalNotes ?? "");

  async function submit() {
    await update(inquiry.id, { status, internalNotes });
  }

  return (
    <FormDialog
      open
      title={copy.contactPanel.title}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={copy.common.save}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      size="md"
    >
      <HubField label={copy.contactPanel.name} value={inquiry.fullName} readOnly disabled />
      <HubField label={copy.contactPanel.email} value={inquiry.email} readOnly disabled />
      {inquiry.phone && <HubField label={copy.contactPanel.phone} value={inquiry.phone} readOnly disabled />}
      <label className="hub-field">
        <span>{copy.contactPanel.message}</span>
        <HubTextarea rows={4} value={inquiry.message} readOnly disabled />
      </label>
      <label className="hub-field">
        <span>{copy.common.status}</span>
        <HubSelect value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="new">{copy.contactPanel.statuses.new}</option>
          <option value="in_progress">{copy.contactPanel.statuses.in_progress}</option>
          <option value="closed">{copy.contactPanel.statuses.closed}</option>
        </HubSelect>
      </label>
      <label className="hub-field">
        <span>{copy.contactPanel.internalNotes}</span>
        <HubTextarea rows={4} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
      </label>
    </FormDialog>
  );
}
