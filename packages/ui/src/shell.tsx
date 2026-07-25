import type { ReactNode } from "react";
import { HubLogo } from "./brand-logo";

export function HubShell({ children, nav }: { children: ReactNode; nav?: ReactNode }) {
  return (
    <div className="hub-shell">
      <header className="hub-shell__header">
        <HubLogo />
        {nav}
      </header>
      <main>{children}</main>
    </div>
  );
}
