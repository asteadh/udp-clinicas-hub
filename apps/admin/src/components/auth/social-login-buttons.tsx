"use client";

import { HubButton, signInGoogle, type GoogleAuthPayload } from "@hubnegocios/ui";
import { useState } from "react";

interface Props {
  disabled?: boolean;
  onGoogle(token: GoogleAuthPayload): Promise<void>;
  onError(message: string): void;
}

export function SocialLoginButtons({ disabled, onGoogle, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  async function run() {
    setLoading(true);
    onError("");
    try {
      await signInGoogle(googleClientId, onGoogle);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Google sign in failed");
    } finally {
      setLoading(false);
    }
  }

  if (!googleClientId) return null;

  return (
    <div className="hub-actions" aria-label="Google sign in">
      <HubButton type="button" variant="secondary" disabled={disabled || loading} onClick={run}>
        {loading ? "Google…" : "Google"}
      </HubButton>
    </div>
  );
}
