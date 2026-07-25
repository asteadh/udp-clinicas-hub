CREATE TABLE IF NOT EXISTS contact_inquiries (
  id text PRIMARY KEY DEFAULT 'inq_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'in_review', 'answered', 'closed')),
  handled_by text REFERENCES app_users(id) ON DELETE SET NULL,
  internal_notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_clinic_idx ON contact_inquiries(clinic_slug, created_at DESC);
CREATE INDEX IF NOT EXISTS contact_inquiries_status_idx ON contact_inquiries(status, created_at DESC);
