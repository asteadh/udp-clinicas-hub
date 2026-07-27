"use client";

import { HubApiError, passkeysSupported, registerPasskey } from "@hubnegocios/api-client";
import { HubAlert, HubButton, HubField, signInGoogle } from "@hubnegocios/ui";
import { KeyRound, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { AdminPageCopy } from "@/lib/copy";
import type { Identities } from "./account-panel";

// Port of the web app's security tab (passkeys + linked Google sign-in),
// sharing the identities payload fetched once by AccountPanel. Hub Negocios
// is Google-only (staff sign in with @udp.cl) — no Facebook/Apple providers.
export function SecuritySection({
  token,
  identities,
  reload,
  copy,
}: {
  token: string;
  identities: Identities | null;
  reload: () => Promise<void>;
  copy: AdminPageCopy;
}) {
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  // passkeysSupported() reads window/navigator → false during SSR; gate on a
  // post-mount state so the button appears once hydrated.
  const [passkeyReady, setPasskeyReady] = useState(false);

  useEffect(() => {
    setPasskeyReady(passkeysSupported());
  }, []);

  async function run(key: string, action: () => Promise<void>, conflictMessage?: string) {
    setError("");
    setNotice("");
    setBusy(key);
    try {
      await action();
      await reload();
    } catch (err) {
      if (conflictMessage && err instanceof HubApiError && err.status === 409) setError(conflictMessage);
      else setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  const addPasskey = () =>
    run("passkey-add", async () => {
      await registerPasskey(api, token, label.trim() || undefined);
      setLabel("");
      setNotice(copy.account.passkeyAdded);
    });

  const removePasskey = (id: string) =>
    run(`passkey-${id}`, () => api.deletePasskey(id, token).then(() => undefined), copy.account.lastMethodConflict);

  const linkGoogle = () =>
    run("link-google", async () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
      await signInGoogle(clientId, async (payload) => {
        await api.linkGoogle({ idToken: payload.idToken }, token);
      });
    });

  const unlink = (provider: string, providerUserId: string) =>
    run(
      `unlink-${provider}`,
      () => api.unlinkIdentity(provider, providerUserId, token).then(() => undefined),
      copy.account.lastMethodConflict,
    );

  const dateFormat = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(copy.dateLocale, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

  const googleEnabled = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  const googleIdentity = identities?.identities.find((item) => item.provider === "google");

  return (
    <section className="rounded-xl border border-hub-border bg-hub-surface p-4">
      <div className="mb-1 flex items-center gap-2">
        <KeyRound size={17} className="text-hub-deep-blue" aria-hidden />
        <h3 className="m-0 text-[14.5px] font-extrabold text-hub-ink">{copy.account.passkeys}</h3>
      </div>
      <p className="m-0 mb-3 text-[12.5px] leading-normal text-hub-muted">{copy.account.passkeysHelp}</p>

      {error && (
        <HubAlert className="hub-alert--danger mb-3">
          {error}
        </HubAlert>
      )}
      {notice && (
        <HubAlert className="hub-alert--info mb-3">
          {notice}
        </HubAlert>
      )}

      {identities && identities.passkeys.length === 0 && (
        <p className="m-0 mb-3 text-[12.5px] text-hub-muted">{copy.account.noPasskeys}</p>
      )}
      {identities && identities.passkeys.length > 0 && (
        <ul className="m-0 mb-3 grid list-none gap-2 p-0">
          {identities.passkeys.map((passkey) => (
            <li
              key={passkey.id}
              className="flex items-center justify-between gap-3 rounded-[10px] border border-hub-border px-3 py-2"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold text-hub-ink">
                  {passkey.label || copy.account.passkeyFallback}
                </div>
                <div className="text-[11.5px] text-hub-muted">
                  {copy.account.created} {dateFormat(passkey.createdAt)} · {copy.account.lastUsed}{" "}
                  {dateFormat(passkey.lastUsedAt) ?? copy.account.never}
                </div>
              </div>
              <HubButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy !== null}
                onClick={() => removePasskey(passkey.id)}
              >
                {copy.account.remove}
              </HubButton>
            </li>
          ))}
        </ul>
      )}

      {passkeyReady ? (
        <div className="flex flex-wrap items-center gap-2">
          <HubField
            label={copy.account.passkeyLabel}
            labelHidden
            placeholder={copy.account.passkeyLabelPlaceholder}
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="min-w-45 flex-1"
          />
          <HubButton type="button" variant="outline" size="sm" disabled={busy !== null} onClick={addPasskey}>
            <KeyRound size={15} aria-hidden />
            {busy === "passkey-add" ? copy.account.addingPasskey : copy.account.addPasskey}
          </HubButton>
        </div>
      ) : (
        <p className="m-0 text-[12.5px] text-hub-muted">{copy.account.passkeyUnsupported}</p>
      )}

      <div className="mb-1 mt-5 flex items-center gap-2">
        <Link2 size={17} className="text-hub-deep-blue" aria-hidden />
        <h3 className="m-0 text-[14.5px] font-extrabold text-hub-ink">{copy.account.linkedAccounts}</h3>
      </div>
      {!googleEnabled && <p className="m-0 text-[12.5px] text-hub-muted">{copy.account.noProviders}</p>}
      {googleEnabled && (
        <ul className="m-0 grid list-none gap-2 p-0">
          <li className="flex items-center justify-between gap-3 rounded-[10px] border border-hub-border px-3 py-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-hub-ink">Google</span>
                {googleIdentity && <span className="hub-pill hub-pill--success">{copy.account.connected}</span>}
              </div>
              {googleIdentity?.email && <div className="truncate text-[11.5px] text-hub-muted">{googleIdentity.email}</div>}
            </div>
            {googleIdentity ? (
              <HubButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={busy !== null}
                onClick={() => unlink(googleIdentity.provider, googleIdentity.providerUserId)}
              >
                {copy.account.disconnect}
              </HubButton>
            ) : (
              <HubButton
                type="button"
                variant="outline"
                size="sm"
                disabled={busy !== null || !identities}
                onClick={linkGoogle}
              >
                {busy === "link-google" ? copy.account.connecting : copy.account.connect}
              </HubButton>
            )}
          </li>
        </ul>
      )}
    </section>
  );
}
