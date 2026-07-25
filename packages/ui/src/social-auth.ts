// Browser-side OAuth SDK glue for the admin login surface. Loads the Google
// Identity Services script on demand and resolves with the token payload the
// API's POST /api/auth/oauth/google endpoint expects. Hub Negocios UDP is
// Google-only (staff sign in with @udp.cl) — no Facebook/Apple providers.

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(options: Record<string, unknown>): void;
          prompt(): void;
        };
      };
    };
  }
}

export interface GoogleAuthPayload {
  idToken: string;
}

export async function signInGoogle(clientId: string, onGoogle: (token: GoogleAuthPayload) => Promise<void>) {
  await loadScript("https://accounts.google.com/gsi/client");
  const google = window.google;
  if (!google) throw new Error("Google sign in is unavailable");
  await new Promise<void>((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential?: string }) => {
        try {
          if (!response.credential) throw new Error("Google did not return a credential");
          await onGoogle({ idToken: response.credential });
          resolve();
        } catch (err) {
          reject(err);
        }
      }
    });
    google.accounts.id.prompt();
  });
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
}
