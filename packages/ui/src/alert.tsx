import type { HTMLAttributes, ReactNode } from "react";

export function HubAlert({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`hub-alert ${className}`.trim()} role="status" {...props}>
      {children}
    </div>
  );
}
