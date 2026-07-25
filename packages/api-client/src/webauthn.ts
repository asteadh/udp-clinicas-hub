/* eslint-disable @typescript-eslint/no-explicit-any */
// Browser-only WebAuthn helpers. The API returns/accepts the standard WebAuthn
// JSON shape (base64url strings for all binary fields); these functions convert
// to/from ArrayBuffers and drive navigator.credentials for the passkey
// ceremonies. Guarded so importing this on the server is harmless.

import type { HubApiClient } from "./client";
import type { HubSession } from "./types";

function base64urlToBuffer(value: string): ArrayBuffer {
  const padding = value.length % 4 === 0 ? "" : "=".repeat(4 - (value.length % 4));
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function passkeysSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.credentials
  );
}

/** Register a new passkey for the signed-in user (requires a bearer token). */
export async function registerPasskey(client: HubApiClient, token: string, label?: string): Promise<void> {
  const { sessionId, options } = await client.passkeyRegisterBegin(token);
  const publicKey = options.publicKey as any;
  publicKey.challenge = base64urlToBuffer(publicKey.challenge);
  publicKey.user.id = base64urlToBuffer(publicKey.user.id);
  if (Array.isArray(publicKey.excludeCredentials)) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    }));
  }

  const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey creation was cancelled");
  const response = credential.response as AuthenticatorAttestationResponse;

  await client.passkeyRegisterFinish(
    {
      sessionId,
      label,
      response: {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: bufferToBase64url(response.attestationObject),
          clientDataJSON: bufferToBase64url(response.clientDataJSON),
        },
        clientExtensionResults: credential.getClientExtensionResults(),
      },
    },
    token
  );
}

async function completeAssertion(
  client: HubApiClient,
  sessionId: string,
  publicKey: any
): Promise<HubSession> {
  publicKey.challenge = base64urlToBuffer(publicKey.challenge);
  if (Array.isArray(publicKey.allowCredentials)) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((c: any) => ({
      ...c,
      id: base64urlToBuffer(c.id),
    }));
  }

  const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
  if (!assertion) throw new Error("Passkey sign-in was cancelled");
  const response = assertion.response as AuthenticatorAssertionResponse;

  return client.passkeyLoginFinish({
    sessionId,
    response: {
      id: assertion.id,
      rawId: bufferToBase64url(assertion.rawId),
      type: assertion.type,
      response: {
        authenticatorData: bufferToBase64url(response.authenticatorData),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
      },
      clientExtensionResults: assertion.getClientExtensionResults(),
    },
  });
}

/** Sign in with a passkey registered to the given email. Returns a session. */
export async function loginWithPasskey(client: HubApiClient, email: string): Promise<HubSession> {
  const { sessionId, options } = await client.passkeyLoginBegin({ email });
  return completeAssertion(client, sessionId, options.publicKey);
}

/** Usernameless one-tap sign-in — the authenticator picks the credential. */
export async function loginWithDiscoverablePasskey(client: HubApiClient): Promise<HubSession> {
  const { sessionId, options } = await client.passkeyDiscoverableLoginBegin();
  return completeAssertion(client, sessionId, options.publicKey);
}
