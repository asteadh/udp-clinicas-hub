"use client";

import { HubButton, HubCard, HubField, HubSectionHeader } from "@hubnegocios/ui";
import type { ComponentProps, FormEvent } from "react";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import type { AdminPageCopy } from "@/lib/copy";

type SocialHandlers = Pick<ComponentProps<typeof SocialLoginButtons>, "onGoogle" | "onError">;

export function LoginCard({
  copy,
  error,
  passkeyReady,
  onLogin,
  onPasskey,
  onGoogle,
  onError,
}: {
  copy: AdminPageCopy;
  error: string;
  passkeyReady: boolean;
  onLogin: (event: FormEvent<HTMLFormElement>) => void;
  onPasskey: (form: HTMLFormElement | null) => void;
} & SocialHandlers) {
  return (
    <main className="mx-auto grid max-w-md gap-4 px-4 py-16">
      <HubSectionHeader eyebrow="Hub Negocios UDP" title={copy.loginTitle}>
        {copy.loginHelp}
      </HubSectionHeader>
      <HubCard>
        <form className="grid gap-3" onSubmit={onLogin}>
          <HubField label={copy.email} name="email" type="email" required />
          <HubField label={copy.password} name="password" type="password" required />
          {error && <p style={{ color: "var(--hub-coral)", fontWeight: 800 }}>{error}</p>}
          <HubButton>{copy.signIn}</HubButton>
          {passkeyReady && (
            <HubButton
              type="button"
              variant="outline"
              className="w-full mt-2"
              onClick={(event) => onPasskey(event.currentTarget.closest("form"))}
            >
              {copy.passkey}
            </HubButton>
          )}
        </form>
        <SocialLoginButtons onGoogle={onGoogle} onError={onError} />
      </HubCard>
    </main>
  );
}
