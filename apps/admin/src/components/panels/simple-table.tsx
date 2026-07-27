"use client";

import type { JsonRecord } from "@hubnegocios/api-client";
import { HubCard, HubDataTable, HubEmptyState } from "@hubnegocios/ui";
import { type AdminPageCopy, formatValue } from "./shared";

// Generic read-only fallback table, keyed off the first row's own fields.
// Used for tabs that don't yet have a dedicated CRUD panel (see task #12).
export function SimpleTable({ title, rows, copy }: { title: string; rows: JsonRecord[]; copy: AdminPageCopy }) {
  if (!rows.length) {
    return <HubEmptyState title={title} description={copy.common.noData} />;
  }
  const keys = Object.keys(rows[0]).slice(0, 6);
  return (
    <HubCard>
      <h2>{title}</h2>
      <HubDataTable>
        <table className="hub-table">
          <thead>
            <tr>{keys.map((key) => <th key={key}>{key}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={String(row.id ?? row.slug ?? row.key ?? index)}>
                {keys.map((key) => (
                  <td key={key}>{formatValue(row[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </HubDataTable>
    </HubCard>
  );
}
