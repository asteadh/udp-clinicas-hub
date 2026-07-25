import type { ReactNode } from "react";
import { HubBrandMark } from "./brand-mark";

export function HubEmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="hub-empty">
      <HubBrandMark className="hub-empty__mark" />
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}
