export function HubStatusPill({ children, tone = "neutral" }: { children: string; tone?: "neutral" | "success" | "danger" | "info" }) {
  return <span className={`hub-pill hub-pill--${tone}`}>{children}</span>;
}
