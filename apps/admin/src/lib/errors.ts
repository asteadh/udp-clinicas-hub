import type { AdminPageCopy } from "./copy";

export function adminErrorMessage(cause: unknown, copy: AdminPageCopy): string {
  const detail = cause instanceof Error ? cause.message : String(cause);
  if (detail.toLowerCase().includes("unauthorized")) {
    return copy.common.sessionExpired;
  }
  return copy.common.actionFailed(detail);
}
