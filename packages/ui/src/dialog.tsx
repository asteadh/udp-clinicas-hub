"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

const DialogLabelContext = createContext<string | undefined>(undefined);

export function HubDialog({
  open,
  onClose,
  size = "sm",
  dismissible = true,
  ariaLabel,
  className = "",
  children,
}: {
  open: boolean;
  onClose: () => void;
  size?: "sm" | "md" | "lg";
  dismissible?: boolean;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (dismissible && event.target === ref.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={ref}
      className={`hub-dialog${size === "sm" ? "" : ` hub-dialog--${size}`} ${className}`.trim()}
      aria-labelledby={ariaLabel ? undefined : titleId}
      aria-label={ariaLabel}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={handleBackdropClick}
    >
      <DialogLabelContext.Provider value={titleId}>{children}</DialogLabelContext.Provider>
    </dialog>
  );
}

export function HubDialogIcon({
  tone = "info",
  children,
}: {
  tone?: "info" | "success" | "danger";
  children: ReactNode;
}) {
  const toneClass = tone === "info" ? "" : ` hub-dialog__icon--${tone}`;
  return <div className={`hub-dialog__icon${toneClass}`}>{children}</div>;
}

export function HubDialogTitle({ children }: { children: ReactNode }) {
  const titleId = useContext(DialogLabelContext);
  return (
    <h3 id={titleId} className="hub-dialog__title">
      {children}
    </h3>
  );
}

export function HubDialogBody({ children }: { children: ReactNode }) {
  return <div className="hub-dialog__body">{children}</div>;
}

export function HubDialogActions({ children }: { children: ReactNode }) {
  return <div className="hub-dialog__actions">{children}</div>;
}
