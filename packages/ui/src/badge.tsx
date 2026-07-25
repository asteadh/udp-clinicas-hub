import type { HTMLAttributes, ReactNode } from "react";

export function HubBadge({ children, className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span className={`hub-badge ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}
