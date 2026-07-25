CREATE TABLE IF NOT EXISTS gallery_albums (
  id text PRIMARY KEY DEFAULT 'alb_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_albums_clinic_idx ON gallery_albums(clinic_slug, sort_order);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id text PRIMARY KEY DEFAULT 'pho_' || encode(gen_random_bytes(12), 'hex'),
  album_id text NOT NULL REFERENCES gallery_albums(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gallery_photos_album_idx ON gallery_photos(album_id, sort_order);
