import type { HTMLAttributes, ReactNode } from "react";

export function HubCard({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div className={`hub-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
