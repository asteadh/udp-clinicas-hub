import type { HTMLAttributes } from "react";

export function HubSkeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`hub-skeleton ${className}`.trim()} aria-hidden {...props} />;
}
