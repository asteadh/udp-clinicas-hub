import type {
  AdminUser,
  AppSetting,
  Article,
  AuditEntry,
  Clinic,
  ClinicSummaryCounts,
  ContactInquiry,
  ContactRequestInput,
  Faq,
  GalleryAlbum,
  HubSession,
  IdentitiesResponse,
  IntakeRequest,
  IntakeRequestInput,
  JsonRecord,
  PasskeyChallenge,
  Principal,
  RequestOptions,
  TeamMember,
} from "./types";

export interface HubApiClientOptions {
  baseUrl?: string;
  fetcher?: typeof fetch;
}

export class HubApiClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: HubApiClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:4000").replace(/\/$/, "");
    this.fetcher = resolveFetcher(options.fetcher);
  }

  // --- Auth -----------------------------------------------------------------

  // Break-glass login for the emergency superadmin created by cmd/seed.
  // Every other account signs in via Google OAuth or a passkey.
  async login(body: { email: string; password: string }) {
    return this.request<HubSession>("/api/auth/login", { method: "POST", body });
  }

  async oauthGoogle(body: { idToken: string; email?: string; firstName?: string; lastName?: string; imageUrl?: string }) {
    return this.request<HubSession>("/api/auth/oauth/google", { method: "POST", body });
  }

  async identities(token: string) {
    return this.request<IdentitiesResponse>("/api/auth/identities", { token });
  }

  async linkGoogle(body: { idToken: string; email?: string; firstName?: string; lastName?: string; imageUrl?: string }, token: string) {
    return this.request<IdentitiesResponse>("/api/auth/oauth/google/link", { method: "POST", body, token });
  }

  async unlinkIdentity(provider: string, providerUserId: string, token: string) {
    return this.request<{ status: string }>(
      `/api/auth/identities/${encodeURIComponent(provider)}/${encodeURIComponent(providerUserId)}`,
      { method: "DELETE", token },
    );
  }

  async deletePasskey(id: string, token: string) {
    return this.request<{ status: string }>(`/api/auth/passkeys/${encodeURIComponent(id)}`, { method: "DELETE", token });
  }

  async refresh(token: string) {
    return this.request<HubSession>("/api/auth/refresh", { method: "POST", token });
  }

  async logout(token: string) {
    return this.request<{ status: boolean }>("/api/auth/logout", { method: "POST", token });
  }

  async me(token: string) {
    return this.request<{ [key: string]: unknown }>("/api/me", { token });
  }

  // --- Passkeys (WebAuthn) ---------------------------------------------------

  async passkeyRegisterBegin(token: string) {
    return this.request<PasskeyChallenge>("/api/auth/passkey/register/begin", { method: "POST", body: {}, token });
  }

  async passkeyRegisterFinish(body: { sessionId: string; response: unknown; label?: string }, token: string) {
    return this.request<{ status: string }>("/api/auth/passkey/register/finish", { method: "POST", body, token });
  }

  async passkeyLoginBegin(body: { email: string }) {
    return this.request<PasskeyChallenge>("/api/auth/passkey/login/begin", { method: "POST", body });
  }

  async passkeyDiscoverableLoginBegin() {
    return this.request<PasskeyChallenge>("/api/auth/passkey/login/discoverable/begin", { method: "POST", body: {} });
  }

  async passkeyLoginFinish(body: { sessionId: string; response: unknown }) {
    return this.request<HubSession>("/api/auth/passkey/login/finish", { method: "POST", body });
  }

  // --- Public content ---------------------------------------------------------

  async clinics() {
    const response = await this.request<{ clinics: Clinic[] }>("/api/clinics");
    return response.clinics ?? [];
  }

  async clinic(slug: string) {
    const response = await this.request<{ clinic: Clinic }>(`/api/clinics/${encodeURIComponent(slug)}`);
    return response.clinic;
  }

  async clinicFaqs(slug: string) {
    const response = await this.request<{ faqs: Faq[] }>(`/api/clinics/${encodeURIComponent(slug)}/faqs`);
    return response.faqs ?? [];
  }

  async clinicArticles(slug: string, page = 1) {
    const response = await this.request<{ articles: Article[] }>(`/api/clinics/${encodeURIComponent(slug)}/articles`, { query: { page } });
    return response.articles ?? [];
  }

  async articles(page = 1) {
    const response = await this.request<{ articles: Article[] }>("/api/articles", { query: { page } });
    return response.articles ?? [];
  }

  async featuredArticle() {
    return this.request<{ article: Article | null }>("/api/articles/featured");
  }

  async article(slug: string) {
    const response = await this.request<{ article: Article }>(`/api/articles/${encodeURIComponent(slug)}`);
    return response.article;
  }

  async clinicGallery(slug: string) {
    const response = await this.request<{ albums: GalleryAlbum[] }>(`/api/clinics/${encodeURIComponent(slug)}/gallery`);
    return response.albums ?? [];
  }

  async galleryAlbum(id: string) {
    const response = await this.request<{ album: GalleryAlbum }>(`/api/gallery/albums/${encodeURIComponent(id)}`);
    return response.album;
  }

  async clinicTeam(slug: string) {
    const response = await this.request<{ team: TeamMember[] }>(`/api/clinics/${encodeURIComponent(slug)}/team`);
    return response.team ?? [];
  }

  async publicSettings() {
    const response = await this.request<{ settings: JsonRecord }>("/api/settings/public");
    return response.settings ?? {};
  }

  async contact(body: ContactRequestInput) {
    return this.request<{ id: string }>("/api/contact", { method: "POST", body });
  }

  async intake(body: IntakeRequestInput) {
    return this.request<{ id: string }>("/api/intake", { method: "POST", body });
  }

  // --- Storage -----------------------------------------------------------------

  async uploadFile(file: Blob, folder: string, token: string) {
    // Multipart upload bypasses the JSON request helper: the browser must set
    // the Content-Type boundary itself, so only Authorization is sent.
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const response = await this.fetcher(`${this.baseUrl}/api/storage/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
      cache: "no-store",
    });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new HubApiError(payload.error ?? `Hub Negocios API request failed: ${response.status}`, response.status, typeof payload.code === "string" ? payload.code : undefined);
    }
    return payload as { path: string; url: string };
  }

  async signedStorageUrl(path: string, token: string) {
    return this.request<{ path: string; url: string }>("/api/storage/signed-url", { query: { path }, token });
  }

  storageUrl(path: string) {
    if (!path || /^https?:\/\//i.test(path)) return path;
    if (path.startsWith("/")) return this.baseUrl + path;
    return `${this.baseUrl}/api/storage/download?path=${encodeURIComponent(path)}`;
  }

  // --- Admin --------------------------------------------------------------------

  admin(token: string) {
    return {
      // Current admin's own principal (role/clinicSlug/permissions)
      me: () => this.request<Principal>("/api/admin/me", { token }),

      // Admin users (superadmin only)
      adminUsers: () => this.request<{ adminUsers: AdminUser[] }>("/api/admin/admin-users", { token }),
      createAdminUser: (body: JsonRecord) => this.request<{ adminUser: AdminUser }>("/api/admin/admin-users", { method: "POST", body, token }),
      updateAdminUser: (userId: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/admin-users/${encodeURIComponent(userId)}`, { method: "PATCH", body, token }),
      deleteAdminUser: (userId: string) => this.request<{ status: boolean }>(`/api/admin/admin-users/${encodeURIComponent(userId)}`, { method: "DELETE", token }),

      // Clinics
      clinics: () => this.request<{ clinics: Clinic[] }>("/api/admin/clinics", { token }),
      updateClinic: (slug: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/clinics/${encodeURIComponent(slug)}`, { method: "PATCH", body, token }),

      // FAQs
      faqs: (clinicSlug: string) => this.request<{ faqs: Faq[] }>("/api/admin/faqs", { token, query: { clinic: clinicSlug } }),
      createFaq: (body: JsonRecord) => this.request<{ id: string }>("/api/admin/faqs", { method: "POST", body, token }),
      updateFaq: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/faqs/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),
      deleteFaq: (id: string) => this.request<{ status: boolean }>(`/api/admin/faqs/${encodeURIComponent(id)}`, { method: "DELETE", token }),
      reorderFaqs: (clinicSlug: string, orderedIds: string[]) => this.request<{ status: boolean }>("/api/admin/faqs/reorder", { method: "POST", body: { clinicSlug, orderedIds }, token }),

      // Articles
      articles: (clinicSlug?: string, status?: string) => this.request<{ articles: Article[] }>("/api/admin/articles", { token, query: { clinic: clinicSlug, status } }),
      article: (id: string) => this.request<{ article: Article }>(`/api/admin/articles/${encodeURIComponent(id)}`, { token }),
      createArticle: (body: JsonRecord) => this.request<{ id: string }>("/api/admin/articles", { method: "POST", body, token }),
      updateArticle: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/articles/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),
      deleteArticle: (id: string) => this.request<{ status: boolean }>(`/api/admin/articles/${encodeURIComponent(id)}`, { method: "DELETE", token }),
      featureArticle: (id: string) => this.request<{ status: boolean }>(`/api/admin/articles/${encodeURIComponent(id)}/feature`, { method: "POST", token }),
      publishArticle: (id: string) => this.request<{ status: boolean }>(`/api/admin/articles/${encodeURIComponent(id)}/publish`, { method: "POST", token }),

      // Gallery
      albums: (clinicSlug: string) => this.request<{ albums: GalleryAlbum[] }>("/api/admin/gallery/albums", { token, query: { clinic: clinicSlug } }),
      createAlbum: (body: JsonRecord) => this.request<{ id: string }>("/api/admin/gallery/albums", { method: "POST", body, token }),
      updateAlbum: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/gallery/albums/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),
      deleteAlbum: (id: string) => this.request<{ status: boolean }>(`/api/admin/gallery/albums/${encodeURIComponent(id)}`, { method: "DELETE", token }),
      addPhoto: (albumId: string, body: JsonRecord) => this.request<{ id: string }>(`/api/admin/gallery/albums/${encodeURIComponent(albumId)}/photos`, { method: "POST", body, token }),
      updatePhoto: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/gallery/photos/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),
      deletePhoto: (id: string) => this.request<{ status: boolean }>(`/api/admin/gallery/photos/${encodeURIComponent(id)}`, { method: "DELETE", token }),

      // Team
      team: (clinicSlug: string) => this.request<{ team: TeamMember[] }>("/api/admin/team", { token, query: { clinic: clinicSlug } }),
      createTeamMember: (body: JsonRecord) => this.request<{ id: string }>("/api/admin/team", { method: "POST", body, token }),
      updateTeamMember: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/team/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),
      deleteTeamMember: (id: string) => this.request<{ status: boolean }>(`/api/admin/team/${encodeURIComponent(id)}`, { method: "DELETE", token }),

      // Contact inquiries
      contactInquiries: (clinicSlug?: string, status?: string) => this.request<{ inquiries: ContactInquiry[] }>("/api/admin/contact-inquiries", { token, query: { clinic: clinicSlug, status } }),
      updateContactInquiry: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/contact-inquiries/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),

      // Intake requests
      intakeRequests: (clinicSlug?: string, status?: string) => this.request<{ intakeRequests: IntakeRequest[] }>("/api/admin/intake-requests", { token, query: { clinic: clinicSlug, status } }),
      updateIntakeRequest: (id: string, body: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/intake-requests/${encodeURIComponent(id)}`, { method: "PATCH", body, token }),

      // Settings (superadmin only)
      settings: () => this.request<{ settings: AppSetting[] }>("/api/admin/settings", { token }),
      updateSetting: (key: string, value: JsonRecord) => this.request<{ status: boolean }>(`/api/admin/settings/${encodeURIComponent(key)}`, { method: "PATCH", body: { value }, token }),

      // Summary + audit
      summary: () => this.request<{ clinic?: ClinicSummaryCounts; totals?: ClinicSummaryCounts; byClinic?: ClinicSummaryCounts[] }>("/api/admin/summary", { token }),
      audit: () => this.request<{ auditLogs: AuditEntry[] }>("/api/admin/audit", { token }),
    };
  }

  private async request<T>(path: string, init: { method?: string; body?: unknown; token?: string | null; query?: RequestOptions["query"] } = {}): Promise<T> {
    const url = new URL(this.baseUrl + path);
    for (const [key, value] of Object.entries(init.query ?? {})) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }

    const headers: Record<string, string> = { Accept: "application/json" };
    if (init.body !== undefined) {
      headers["Content-Type"] = "application/json";
    }
    if (init.token) {
      headers.Authorization = `Bearer ${init.token}`;
    }

    const response = await this.fetcher(url, {
      method: init.method ?? "GET",
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) {
      throw new HubApiError(payload.error ?? `Hub Negocios API request failed: ${response.status}`, response.status, typeof payload.code === "string" ? payload.code : undefined);
    }
    return payload as T;
  }
}

export class HubApiError extends Error {
  readonly code?: string;
  readonly status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "HubApiError";
    this.status = status;
    this.code = code;
  }
}

function resolveFetcher(fetcher?: typeof fetch): typeof fetch {
  if (fetcher && fetcher !== globalThis.fetch) {
    return fetcher;
  }
  return globalThis.fetch.bind(globalThis);
}
