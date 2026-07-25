CREATE TABLE IF NOT EXISTS faqs (
  id text PRIMARY KEY DEFAULT 'faq_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  question text NOT NULL,
  answer_html text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS faqs_clinic_idx ON faqs(clinic_slug, sort_order);

CREATE TABLE IF NOT EXISTS articles (
  id text PRIMARY KEY DEFAULT 'art_' || encode(gen_random_bytes(12), 'hex'),
  clinic_slug text NOT NULL REFERENCES clinics(slug) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  cover_image_url text NOT NULL DEFAULT '',
  author_name text NOT NULL DEFAULT '',
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (clinic_slug, slug)
);

CREATE INDEX IF NOT EXISTS articles_clinic_idx ON articles(clinic_slug, published_at DESC);
CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(is_published, published_at DESC);
