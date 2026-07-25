import type { ReactNode } from "react";

export function HubDataTable({ children }: { children: ReactNode }) {
  return <div className="hub-table-wrap">{children}</div>;
}
