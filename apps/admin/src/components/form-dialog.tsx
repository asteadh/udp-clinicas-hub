"use client";

import { HubAlert, HubButton, HubDialog, HubDialogActions, HubDialogBody, HubDialogTitle } from "@hubnegocios/ui";
import { useState, type ReactNode } from "react";

export function FormDialog({
  open,
  title,
  onClose,
  onSubmit,
  onSaved,
  submitLabel,
  cancelLabel,
  busyLabel,
  submitDisabled = false,
  destructive = false,
  size = "md",
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  onSaved?: () => void;
  submitLabel: string;
  cancelLabel: string;
  busyLabel: string;
  submitDisabled?: boolean;
  destructive?: boolean;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function close() {
    if (busy) return;
    setError("");
    onClose();
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      await onSubmit();
      onClose();
      onSaved?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <HubDialog open={open} onClose={close} size={size} className="max-h-[85dvh] overflow-y-auto">
      <HubDialogTitle>{title}</HubDialogTitle>
      <HubDialogBody>
        {error && <HubAlert className="hub-alert--danger mb-3">{error}</HubAlert>}
        <div className="grid gap-3 text-left">{children}</div>
      </HubDialogBody>
      <HubDialogActions>
        <HubButton type="button" variant="ghost" disabled={busy} onClick={close}>
          {cancelLabel}
        </HubButton>
        <HubButton type="button" variant={destructive ? "danger" : "primary"} disabled={busy || submitDisabled} onClick={submit}>
          {busy ? busyLabel : submitLabel}
        </HubButton>
      </HubDialogActions>
    </HubDialog>
  );
}

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}
