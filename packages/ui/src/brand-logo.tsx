import { HubBrandMark } from "./brand-mark";

export function HubLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="hub-logo" aria-label="Hub Negocios UDP">
      <HubBrandMark className="hub-logo__mark" />
      {!compact && <span className="hub-logo__word">Hub Negocios</span>}
    </span>
  );
}
