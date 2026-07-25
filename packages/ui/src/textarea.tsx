import type { TextareaHTMLAttributes } from "react";

export function HubTextarea({ className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`hub-input ${className}`.trim()} {...props} />;
}
