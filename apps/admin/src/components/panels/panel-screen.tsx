import type { ClinicSummaryCounts } from "@hubnegocios/api-client";
import { HubCard, HubStatCard } from "@hubnegocios/ui";
import type { AdminPageCopy } from "./shared";

// Dashboard tab: a clinic_admin sees their own counts; a superadmin sees
// institution-wide totals plus a per-clinic breakdown (summary() returns
// {clinic} for the former, {totals, byClinic} for the latter).
export function PanelScreen({
  summary,
  copy,
}: {
  summary: { clinic?: ClinicSummaryCounts; totals?: ClinicSummaryCounts; byClinic?: ClinicSummaryCounts[] };
  copy: AdminPageCopy;
}) {
  const totals = summary.clinic ?? summary.totals;

  return (
    <div className="grid gap-4">
      <h2 className="m-0 text-lg font-extrabold text-hub-ink">{copy.panelScreen.title}</h2>
      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <HubStatCard label={copy.panelScreen.faqs} value={totals.faqs} tone="gold" />
          <HubStatCard label={copy.panelScreen.articles} value={totals.articles} tone="blue" />
          <HubStatCard label={copy.panelScreen.galleryAlbums} value={totals.galleryAlbums} tone="mint" />
          <HubStatCard label={copy.panelScreen.teamMembers} value={totals.teamMembers} tone="blue" />
          <HubStatCard label={copy.panelScreen.pendingInquiries} value={totals.pendingInquiries} tone="coral" />
        </div>
      )}
      {summary.byClinic && summary.byClinic.length > 0 && (
        <HubCard>
          <h3 className="m-0 mb-3 text-sm font-extrabold text-hub-ink">{copy.panelScreen.byClinic}</h3>
          <div className="grid gap-3">
            {summary.byClinic.map((row) => (
              <div key={row.clinicSlug} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <span className="col-span-2 self-center text-sm font-bold capitalize text-hub-ink sm:col-span-3 lg:col-span-1">
                  {row.clinicSlug}
                </span>
                <HubStatCard label={copy.panelScreen.faqs} value={row.faqs} tone="gold" />
                <HubStatCard label={copy.panelScreen.articles} value={row.articles} tone="blue" />
                <HubStatCard label={copy.panelScreen.galleryAlbums} value={row.galleryAlbums} tone="mint" />
                <HubStatCard label={copy.panelScreen.teamMembers} value={row.teamMembers} tone="blue" />
                <HubStatCard label={copy.panelScreen.pendingInquiries} value={row.pendingInquiries} tone="coral" />
              </div>
            ))}
          </div>
        </HubCard>
      )}
    </div>
  );
}
