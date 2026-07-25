import type { HubSession } from "./types";

// A single session cookie for the admin console. Stored client-readable (not
// httpOnly) because the app attaches the token as an Authorization bearer to
// the Go API, mirroring how the browser WebAuthn ceremonies already work.

const COOKIE_NAME = "hubnegocios_session";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12h, matches the API token TTL

function cookieDomain(): string {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  // Share across every *.hubnegocios.udp.cl subdomain; host-only elsewhere
  // (localhost/previews), where cross-port sharing already works.
  if (host === "hubnegocios.udp.cl" || host.endsWith(".hubnegocios.udp.cl")) return "hubnegocios.udp.cl";
  return "";
}

export function readSessionCookie(): HubSession | null {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_NAME}=`;
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(prefix));
  if (!entry) return null;
  try {
    const value = decodeURIComponent(entry.slice(prefix.length));
    const parsed = JSON.parse(value) as HubSession;
    return parsed?.accessToken ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSessionCookie(session: HubSession): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomain();
  const secure = window.location.protocol === "https:";
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(session))}`,
    "Path=/",
    `Max-Age=${MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ];
  if (domain) parts.push(`Domain=${domain}`);
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  const domain = cookieDomain();
  const parts = [`${COOKIE_NAME}=`, "Path=/", "Max-Age=0", "SameSite=Lax"];
  if (domain) parts.push(`Domain=${domain}`);
  document.cookie = parts.join("; ");
}
