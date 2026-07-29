CREATE TABLE IF NOT EXISTS intake_requests (
  id text PRIMARY KEY DEFAULT 'ntk_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  full_name text NOT NULL,
  rut text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  case_type text NOT NULL DEFAULT '',
  case_description text NOT NULL,
  has_documentation text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'accepted', 'rejected', 'closed')),
  handled_by text REFERENCES app_users(id) ON DELETE SET NULL,
  internal_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS intake_requests_clinic_idx ON intake_requests(clinic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS intake_requests_status_idx ON intake_requests(status, created_at DESC);
