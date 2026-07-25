export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonRecord = Record<string, JsonValue | unknown>;

export interface HubSession {
  accessToken: string;
  tokenType: string;
  user: HubUser;
}

export interface HubUser extends JsonRecord {
  id: string;
  uid: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
  suspended?: boolean;
  inactive?: boolean;
}

// WebAuthn ceremony options as returned by the API. `options.publicKey` holds
// the base64url-encoded PublicKeyCredential(Creation|Request)OptionsJSON that
// the browser helper converts to/from ArrayBuffers.
export interface PasskeyChallenge {
  sessionId: string;
  options: { publicKey: Record<string, unknown> };
}

export interface IdentityRecord extends JsonRecord {
  provider: string;
  providerUserId: string;
  email: string | null;
  createdAt: string;
}

export interface PasskeyRecord extends JsonRecord {
  id: string;
  label: string;
  createdAt: string;
  lastUsedAt: string | null;
}

export interface IdentitiesResponse extends JsonRecord {
  email: string | null;
  hasPassword: boolean;
  identities: IdentityRecord[];
  passkeys: PasskeyRecord[];
}

export type AdminRole = "superadmin" | "clinic_admin";

// Resolved identity of the calling admin, as returned by GET /api/admin/me.
// clinicSlug is empty for a superadmin (full access across clinics).
export interface Principal extends JsonRecord {
  userId: string;
  email: string;
  role: AdminRole;
  clinicSlug?: string;
  permissions: string[];
}

export type ClinicSlug =
  | "insolvencia"
  | "innovacion-emprendimiento"
  | "laboral"
  | "tributario"
  | string;

export interface Clinic extends JsonRecord {
  slug: ClinicSlug;
  name: string;
  shortDescription: string;
  descriptionHtml?: string;
  icon?: string;
  colorPrimary?: string;
  imageUrl?: string;
  contactEmail?: string;
  sortOrder?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Faq extends JsonRecord {
  id: string;
  clinicSlug: ClinicSlug;
  question: string;
  answerHtml: string;
  sortOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Article extends JsonRecord {
  id: string;
  clinicSlug: ClinicSlug;
  slug: string;
  title: string;
  excerpt?: string;
  bodyHtml?: string;
  coverImageUrl?: string;
  authorName?: string;
  isPublished?: boolean;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface GalleryPhoto extends JsonRecord {
  id: string;
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
}

export interface GalleryAlbum extends JsonRecord {
  id: string;
  clinicSlug: ClinicSlug;
  title: string;
  description?: string;
  coverImageUrl?: string;
  sortOrder?: number;
  isPublished?: boolean;
  photos?: GalleryPhoto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember extends JsonRecord {
  id: string;
  clinicSlug: ClinicSlug;
  fullName: string;
  roleTitle?: string;
  bioHtml?: string;
  photoUrl?: string;
  email?: string;
  sortOrder?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactInquiry extends JsonRecord {
  id: string;
  clinicSlug: ClinicSlug;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "in_progress" | "closed" | string;
  handledBy?: string | null;
  internalNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactRequestInput extends JsonRecord {
  clinicSlug: string;
  name: string;
  email: string;
  message: string;
  phone?: string;
  metadata?: JsonRecord;
}

export interface AdminUser extends JsonRecord {
  userId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: AdminRole;
  clinicSlug?: string | null;
  permissions: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditEntry extends JsonRecord {
  id: string;
  actorId: string;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: JsonRecord;
  createdAt: string;
}

export interface AppSetting extends JsonRecord {
  key: string;
  value: JsonRecord;
  updatedBy?: string | null;
  updatedAt?: string;
}

export interface ClinicSummaryCounts extends JsonRecord {
  clinicSlug: string;
  faqs: number;
  articles: number;
  galleryAlbums: number;
  teamMembers: number;
  pendingInquiries: number;
}

export interface RequestOptions {
  token?: string | null;
  query?: Record<string, string | number | boolean | undefined | null>;
}
