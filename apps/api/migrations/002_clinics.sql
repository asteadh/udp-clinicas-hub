CREATE TABLE IF NOT EXISTS clinics (
  slug text PRIMARY KEY,
  name text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  description_html text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT '',
  color_primary text NOT NULL DEFAULT '#0B3D62',
  image_url text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS clinics_sort_idx ON clinics(sort_order);
