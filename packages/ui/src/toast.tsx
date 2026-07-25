"use client";

import { useEffect, type ReactNode } from "react";

export type HubToast = {
  id: string;
  message: ReactNode;
  tone?: "info" | "success" | "danger";
  icon?: ReactNode;
};

const TOAST_DURATION_MS = 5000;
const MAX_VISIBLE_TOASTS = 2;

function ToastItem({ toast, onDismiss }: { toast: HubToast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const toneClass = toast.tone && toast.tone !== "info" ? ` hub-toast--${toast.tone}` : "";
  return (
    <div className={`hub-toast${toneClass}`} role="status">
      {toast.icon && <span className="hub-toast__icon" aria-hidden>{toast.icon}</span>}
      <span>{toast.message}</span>
      <button
        type="button"
        className="hub-toast__close"
        aria-label="Cerrar"
        onClick={() => onDismiss(toast.id)}
      >
        ×
      </button>
    </div>
  );
}

export function HubToastStack({
  toasts,
  onDismiss,
}: {
  toasts: HubToast[];
  onDismiss: (id: string) => void;
}) {
  const visible = toasts.slice(-MAX_VISIBLE_TOASTS);
  if (visible.length === 0) return null;
  return (
    <div className="hub-toast-stack">
      {visible.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function HubInlineBanner({
  tone = "info",
  action,
  onAction,
  className = "",
  children,
}: {
  tone?: "info" | "warning" | "danger";
  action?: ReactNode;
  onAction?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`hub-banner hub-banner--${tone} ${className}`.trim()} role="status">
      <span>{children}</span>
      {action && (
        <button type="button" className="hub-banner__action" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
