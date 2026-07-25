CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS app_users (
  id text PRIMARY KEY,
  uid text UNIQUE NOT NULL,
  email text UNIQUE,
  email_verified boolean NOT NULL DEFAULT false,
  password_hash text NOT NULL DEFAULT '',
  first_name text,
  last_name text,
  image_url text,
  status text NOT NULL DEFAULT 'invited'
    CHECK (status IN ('invited', 'active', 'suspended')),
  suspended boolean NOT NULL DEFAULT false,
  inactive boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS oauth_identities (
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS oauth_identities_user_idx ON oauth_identities(user_id);
