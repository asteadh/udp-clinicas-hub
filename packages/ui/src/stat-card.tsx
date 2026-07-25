export function HubStatCard({ label, value, tone = "gold" }: { label: string; value: string | number; tone?: "gold" | "blue" | "mint" | "coral" }) {
  return (
    <div className={`hub-stat hub-stat--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
