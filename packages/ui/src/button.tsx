import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "deep" | "outline" | "link";
type ButtonSize = "sm" | "md" | "lg";

export function HubButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}) {
  const sizeClass = size === "md" ? "" : ` hub-button--${size}`;
  return (
    <button className={`hub-button hub-button--${variant}${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
