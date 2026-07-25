CREATE TABLE IF NOT EXISTS team_members (
  id text PRIMARY KEY DEFAULT 'team_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  full_name text NOT NULL,
  role_title text NOT NULL DEFAULT '',
  bio_html text NOT NULL DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS team_members_clinic_idx ON team_members(clinic_slug, sort_order);
