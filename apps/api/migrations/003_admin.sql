-- Admin roles carry an optional clinic scope: NULL for superadmin (full access),
-- required for clinic_admin (write access limited to that clinic's content).
CREATE TABLE IF NOT EXISTS admin_roles (
  user_id text PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'clinic_admin'
    CHECK (role IN ('superadmin', 'clinic_admin')),
  clinic_slug text REFERENCES clinics(slug),
  permissions text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT clinic_admin_requires_clinic
    CHECK (role <> 'clinic_admin' OR clinic_slug IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS admin_roles_clinic_idx ON admin_roles(clinic_slug);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id bigserial PRIMARY KEY,
  actor_id text REFERENCES app_users(id) ON DELETE SET NULL,
  action text NOT NULL,
  target_type text NOT NULL,
  target_id text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_actor_idx ON admin_audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_logs_target_idx ON admin_audit_logs(target_type, target_id, created_at DESC);
