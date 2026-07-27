"use client";

import type { AppSetting } from "@hubnegocios/api-client";
import { HubAlert, HubButton, HubCard, HubDataTable, HubEmptyState, HubField, HubTextarea } from "@hubnegocios/ui";
import { FormEvent, useState } from "react";
import { formatValue, type AdminPageCopy } from "./shared";

export function SettingsPanel({
  rows,
  updateSetting,
  refresh,
  copy,
}: {
  rows: AppSetting[];
  updateSetting: (key: string, value: Record<string, unknown>) => Promise<unknown>;
  refresh: () => void;
  copy: AdminPageCopy;
}) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("{}");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(value);
    } catch {
      setError(copy.settingsPanel.invalidJson);
      return;
    }
    setBusy(true);
    try {
      await updateSetting(key, parsed);
      setKey("");
      setValue("{}");
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <HubCard>
      <h2 className="mb-3">{copy.settingsPanel.title}</h2>
      <form className="grid gap-3 mb-4" onSubmit={submit}>
        {error && <HubAlert className="hub-alert--danger">{error}</HubAlert>}
        <HubField label={copy.settingsPanel.key} value={key} onChange={(event) => setKey(event.target.value)} required />
        <label className="hub-field">
          <span>{copy.settingsPanel.value}</span>
          <HubTextarea rows={4} value={value} onChange={(event) => setValue(event.target.value)} spellCheck={false} />
        </label>
        <HubButton type="submit" disabled={busy || !key.trim()}>
          {busy ? copy.common.saving : copy.common.save}
        </HubButton>
      </form>
      {rows.length === 0 ? (
        <HubEmptyState title={copy.settingsPanel.title} description={copy.common.noData} />
      ) : (
        <HubDataTable>
          <table className="hub-table">
            <thead>
              <tr>
                <th>{copy.settingsPanel.key}</th>
                <th>{copy.settingsPanel.value}</th>
                <th>{copy.settingsPanel.updatedBy}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.key}</td>
                  <td>{formatValue(row.value)}</td>
                  <td>{row.updatedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </HubDataTable>
      )}
    </HubCard>
  );
}
