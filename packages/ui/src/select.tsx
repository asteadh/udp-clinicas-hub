import type { SelectHTMLAttributes } from "react";

export function HubSelect({ className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`hub-input ${className}`.trim()} {...props} />;
}
