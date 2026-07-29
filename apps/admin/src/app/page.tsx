"use client";

import type {
  AdminUser,
  Article,
  AppSetting,
  AuditEntry,
  Clinic,
  ClinicSummaryCounts,
  ContactInquiry,
  Faq,
  GalleryAlbum,
  IntakeRequest,
  Principal,
  TeamMember,
} from "@hubnegocios/api-client";
import {
  clearSessionCookie,
  loginWithDiscoverablePasskey,
  loginWithPasskey,
  passkeysSupported,
  readSessionCookie,
  writeSessionCookie,
} from "@hubnegocios/api-client";
import { HubAlert, HubLoading } from "@hubnegocios/ui";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AccountPanel } from "@/components/account/account-panel";
import { AdminHeader } from "@/components/admin-header";
import {
  AdminUsersPanel,
  ArticlesPanel,
  ClinicSwitcher,
  ClinicsPanel,
  FaqsPanel,
  GalleryPanel,
  IntakePanel,
  LoginCard,
  PanelScreen,
  SettingsPanel,
  SimpleTable,
  StatusPanel,
  TeamPanel,
} from "@/components/panels";
import { AdminSidebar } from "@/components/sidebar/sidebar";
import { ADMIN_TABS, type AdminTab } from "@/components/sidebar/nav";
import { api } from "@/lib/api";
import { adminPageCopy as copy } from "@/lib/copy";
import { adminErrorMessage } from "@/lib/errors";

function readTabFromUrl(): AdminTab {
  if (typeof window === "undefined") return "panel";
  const requested = new URLSearchParams(window.location.search).get("tab");
  return ADMIN_TABS.includes(requested as AdminTab) ? (requested as AdminTab) : "panel";
}

const CLINIC_SCOPED_TABS: AdminTab[] = ["faqs", "articles", "gallery", "team"];

export default function AdminConsole() {
  const [token, setToken] = useState("");
  const [principal, setPrincipal] = useState<Principal | null>(null);
  // passkeysSupported() touches window/navigator, so it's false during SSR.
  // Evaluate it after mount so the button appears once hydrated (rendering it
  // directly would keep the false server result and the button never shows).
  const [passkeyReady, setPasskeyReady] = useState(false);
  const [tab, setTab] = useState<AdminTab>(readTabFromUrl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState<{ clinic?: ClinicSummaryCounts; totals?: ClinicSummaryCounts; byClinic?: ClinicSummaryCounts[] }>({});
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [activeClinic, setActiveClinic] = useState("");
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [contactInquiries, setContactInquiries] = useState<ContactInquiry[]>([]);
  const [intakeRequests, setIntakeRequests] = useState<IntakeRequest[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);

  const admin = useMemo(() => (token ? api.admin(token) : null), [token]);
  const isSuperadmin = principal?.role === "superadmin";
  const clinicScopedSlug = isSuperadmin ? activeClinic : (principal?.clinicSlug ?? "");

  useEffect(() => {
    setPasskeyReady(passkeysSupported());
  }, []);

  useEffect(() => {
    // Adopt the shared cross-subdomain session (set by the web app or a
    // previous admin visit). Verifying admin access is silent: a non-admin
    // session leaves the cookie intact so the user stays signed in on the
    // web app; admin just shows its login.
    const shared = readSessionCookie()?.accessToken;
    if (shared) {
      acceptAdminSession(shared).catch(() => {
        /* not an admin account — fall through to the login screen */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!admin || !principal) return;
    refresh(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin, principal, tab, activeClinic]);

  function selectTab(next: AdminTab) {
    setTab(next);
    // Keep ?tab= in sync so deep links and reloads land on the same tab.
    const url = new URL(window.location.href);
    url.searchParams.set("tab", next);
    window.history.replaceState(null, "", url);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const session = await api.login({ email: String(form.get("email")), password: String(form.get("password")) });
      await acceptAdminSession(session.accessToken);
      // Share with the web app (and persist) only once admin access is confirmed.
      writeSessionCookie(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.permissionError);
    }
  }

  async function acceptAdminSession(sessionToken: string) {
    const me = await api.admin(sessionToken).me();
    setPrincipal(me);
    setToken(sessionToken);
  }

  async function loginPasskey(form: HTMLFormElement | null) {
    setError("");
    // One-tap first: discoverable login needs no email. Fall back to the
    // email-scoped ceremony only when the user already typed one.
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    try {
      const session = email ? await loginWithPasskey(api, email) : await loginWithDiscoverablePasskey(api);
      await acceptAdminSession(session.accessToken);
      writeSessionCookie(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.permissionError);
    }
  }

  async function refresh(nextTab = tab) {
    if (!admin) return;
    setLoading(true);
    setError("");
    try {
      // Sidebar badges derive from the summary, so refresh it on every tab
      // switch (in parallel with the tab's own data) to keep counts current.
      const summaryPromise = admin.summary();
      const clinicsPromise = clinics.length ? Promise.resolve(clinics) : admin.clinics().then((r) => r.clinics);

      if (CLINIC_SCOPED_TABS.includes(nextTab)) {
        const loadedClinics = await clinicsPromise;
        if (loadedClinics !== clinics) setClinics(loadedClinics);
        const slug = isSuperadmin ? activeClinic || loadedClinics[0]?.slug || "" : (principal?.clinicSlug ?? "");
        if (isSuperadmin && !activeClinic && slug) setActiveClinic(slug);
        if (slug) {
          if (nextTab === "faqs") setFaqs((await admin.faqs(slug)).faqs);
          if (nextTab === "articles") setArticles((await admin.articles(slug)).articles);
          if (nextTab === "gallery") setAlbums((await admin.albums(slug)).albums);
          if (nextTab === "team") setTeam((await admin.team(slug)).team);
        }
      }
      if (nextTab === "contact") setContactInquiries((await admin.contactInquiries(isSuperadmin ? undefined : principal?.clinicSlug)).inquiries);
      if (nextTab === "intake") setIntakeRequests((await admin.intakeRequests(isSuperadmin ? undefined : principal?.clinicSlug)).intakeRequests);
      if (nextTab === "clinics" && isSuperadmin) setClinics((await admin.clinics()).clinics);
      if (nextTab === "adminUsers" && isSuperadmin) {
        const loadedClinics = await clinicsPromise;
        if (loadedClinics !== clinics) setClinics(loadedClinics);
      }
      if (nextTab === "adminUsers" && isSuperadmin) setAdminUsers((await admin.adminUsers()).adminUsers);
      if (nextTab === "settings" && isSuperadmin) setSettings((await admin.settings()).settings);
      if (nextTab === "audit" && isSuperadmin) setAudit((await admin.audit()).auditLogs);
      // "account" self-fetches; only the summary refreshes here.
      setSummary(await summaryPromise);
    } catch (err) {
      setError(adminErrorMessage(err, copy));
    } finally {
      setLoading(false);
    }
  }

  if (!token || !principal) {
    return (
      <>
        <AdminHeader />
        <LoginCard
          copy={copy}
          error={error}
          passkeyReady={passkeyReady}
          onLogin={login}
          onPasskey={loginPasskey}
          onGoogle={async (payload) => {
            const session = await api.oauthGoogle({ idToken: payload.idToken });
            await acceptAdminSession(session.accessToken);
            writeSessionCookie(session);
          }}
          onError={setError}
        />
      </>
    );
  }

  const name = principal.email ? (principal.email.split("@")[0] ?? "").replace(/[._-]+/g, " ") : "Admin";
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "A";

  return (
    <main className="min-h-screen bg-hub-warm-surface flex flex-col lg:flex-row">
      <AdminSidebar
        tab={tab}
        onSelect={selectTab}
        copy={copy}
        operator={{ name, role: copy.adminUsersPanel.roles[principal.role], email: principal.email, initials, isSuperadmin }}
        onSignOut={() => {
          clearSessionCookie();
          setToken("");
          setPrincipal(null);
        }}
      />
      <section className="flex-1 min-w-0 px-4 md:px-6 py-5">
        {error && <HubAlert className="hub-alert--danger">{error}</HubAlert>}
        {loading ? (
          <HubLoading label={copy.loading} />
        ) : (
          <>
            {isSuperadmin && CLINIC_SCOPED_TABS.includes(tab) && (
              <div className="mb-4">
                <ClinicSwitcher clinics={clinics} value={activeClinic} onChange={setActiveClinic} copy={copy} />
              </div>
            )}
            {tab === "panel" && <PanelScreen summary={summary} copy={copy} />}
            {tab === "faqs" && (
              <FaqsPanel
                rows={faqs}
                clinicSlug={clinicScopedSlug}
                createFaq={(body) => admin!.createFaq(body)}
                updateFaq={(id, body) => admin!.updateFaq(id, body)}
                deleteFaq={(id) => admin!.deleteFaq(id)}
                reorderFaqs={(orderedIds) => admin!.reorderFaqs(clinicScopedSlug, orderedIds)}
                refresh={() => refresh("faqs")}
                copy={copy}
              />
            )}
            {tab === "articles" && (
              <ArticlesPanel
                rows={articles}
                clinicSlug={clinicScopedSlug}
                token={token}
                getArticle={(id) => admin!.article(id).then((r) => r.article)}
                createArticle={(body) => admin!.createArticle(body)}
                updateArticle={(id, body) => admin!.updateArticle(id, body)}
                deleteArticle={(id) => admin!.deleteArticle(id)}
                publishArticle={(id) => admin!.publishArticle(id)}
                refresh={() => refresh("articles")}
                copy={copy}
              />
            )}
            {tab === "gallery" && (
              <GalleryPanel
                rows={albums}
                clinicSlug={clinicScopedSlug}
                token={token}
                createAlbum={(body) => admin!.createAlbum(body)}
                updateAlbum={(id, body) => admin!.updateAlbum(id, body)}
                deleteAlbum={(id) => admin!.deleteAlbum(id)}
                addPhoto={(albumId, body) => admin!.addPhoto(albumId, body)}
                updatePhoto={(id, body) => admin!.updatePhoto(id, body)}
                deletePhoto={(id) => admin!.deletePhoto(id)}
                refresh={() => refresh("gallery")}
                copy={copy}
              />
            )}
            {tab === "team" && (
              <TeamPanel
                rows={team}
                clinicSlug={clinicScopedSlug}
                token={token}
                createTeamMember={(body) => admin!.createTeamMember(body)}
                updateTeamMember={(id, body) => admin!.updateTeamMember(id, body)}
                deleteTeamMember={(id) => admin!.deleteTeamMember(id)}
                refresh={() => refresh("team")}
                copy={copy}
              />
            )}
            {tab === "contact" && (
              <StatusPanel
                rows={contactInquiries}
                update={(id, body) => admin!.updateContactInquiry(id, body)}
                refresh={() => refresh("contact")}
                copy={copy}
              />
            )}
            {tab === "intake" && (
              <IntakePanel
                rows={intakeRequests}
                update={(id, body) => admin!.updateIntakeRequest(id, body)}
                refresh={() => refresh("intake")}
                copy={copy}
              />
            )}
            {tab === "clinics" && isSuperadmin && (
              <ClinicsPanel
                rows={clinics}
                token={token}
                updateClinic={(slug, body) => admin!.updateClinic(slug, body)}
                refresh={() => refresh("clinics")}
                copy={copy}
              />
            )}
            {tab === "adminUsers" && isSuperadmin && (
              <AdminUsersPanel
                rows={adminUsers}
                clinics={clinics}
                createAdminUser={(body) => admin!.createAdminUser(body)}
                updateAdminUser={(userId, body) => admin!.updateAdminUser(userId, body)}
                deleteAdminUser={(userId) => admin!.deleteAdminUser(userId)}
                refresh={() => refresh("adminUsers")}
                copy={copy}
              />
            )}
            {tab === "settings" && isSuperadmin && (
              <SettingsPanel
                rows={settings}
                updateSetting={(key, value) => admin!.updateSetting(key, value)}
                refresh={() => refresh("settings")}
                copy={copy}
              />
            )}
            {tab === "audit" && isSuperadmin && <SimpleTable title={copy.tabs.audit} rows={audit} copy={copy} />}
            {tab === "account" && <AccountPanel token={token} principal={principal} copy={copy} />}
          </>
        )}
      </section>
    </main>
  );
}
