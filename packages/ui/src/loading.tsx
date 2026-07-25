export function HubLoading({ label = "Cargando Hub Negocios…" }: { label?: string }) {
  return (
    <div className="hub-loading" role="status" aria-live="polite">
      <span />
      <strong>{label}</strong>
    </div>
  );
}
