"use client";

import type { IntakeRequest, JsonRecord } from "@hubnegocios/api-client";
import { HubField, HubSelect, HubTextarea } from "@hubnegocios/ui";
import { useState } from "react";
import { FormDialog } from "@/components/form-dialog";
import type { AdminPageCopy } from "./shared";

export function IntakeDialog({
  request,
  update,
  onClose,
  onSaved,
  copy,
}: {
  request: IntakeRequest;
  update: (id: string, body: JsonRecord) => Promise<unknown>;
  onClose: () => void;
  onSaved: () => void;
  copy: AdminPageCopy;
}) {
  const [status, setStatus] = useState(request.status);
  const [internalNotes, setInternalNotes] = useState(request.internalNotes ?? "");

  async function submit() {
    await update(request.id, { status, internalNotes });
  }

  return (
    <FormDialog
      open
      title={copy.intakePanel.title}
      onClose={onClose}
      onSubmit={submit}
      onSaved={onSaved}
      submitLabel={copy.common.save}
      cancelLabel={copy.common.cancel}
      busyLabel={copy.common.saving}
      size="md"
    >
      <HubField label={copy.intakePanel.fullName} value={request.fullName} readOnly disabled />
      <HubField label={copy.intakePanel.rut} value={request.rut} readOnly disabled />
      <HubField label={copy.intakePanel.email} value={request.email} readOnly disabled />
      {request.phone && <HubField label={copy.intakePanel.phone} value={request.phone} readOnly disabled />}
      {request.caseType && <HubField label={copy.intakePanel.caseType} value={request.caseType} readOnly disabled />}
      <label className="hub-field">
        <span>{copy.intakePanel.caseDescription}</span>
        <HubTextarea rows={4} value={request.caseDescription} readOnly disabled />
      </label>
      {request.hasDocumentation && (
        <label className="hub-field">
          <span>{copy.intakePanel.hasDocumentation}</span>
          <HubTextarea rows={3} value={request.hasDocumentation} readOnly disabled />
        </label>
      )}
      <label className="hub-field">
        <span>{copy.common.status}</span>
        <HubSelect value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="new">{copy.intakePanel.statuses.new}</option>
          <option value="in_review">{copy.intakePanel.statuses.in_review}</option>
          <option value="accepted">{copy.intakePanel.statuses.accepted}</option>
          <option value="rejected">{copy.intakePanel.statuses.rejected}</option>
          <option value="closed">{copy.intakePanel.statuses.closed}</option>
        </HubSelect>
      </label>
      <label className="hub-field">
        <span>{copy.intakePanel.internalNotes}</span>
        <HubTextarea rows={4} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} />
      </label>
    </FormDialog>
  );
}
