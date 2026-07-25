CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id text PRIMARY KEY DEFAULT 'cred_' || encode(gen_random_bytes(12), 'hex'),
  user_id text NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  credential_id text UNIQUE NOT NULL,
  data jsonb NOT NULL,
  label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

CREATE INDEX IF NOT EXISTS webauthn_credentials_user_idx ON webauthn_credentials(user_id);

CREATE TABLE IF NOT EXISTS webauthn_sessions (
  id text PRIMARY KEY DEFAULT 'wsess_' || encode(gen_random_bytes(12), 'hex'),
  user_id text REFERENCES app_users(id) ON DELETE CASCADE,
  purpose text NOT NULL,
  data jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '5 minutes'
);

CREATE INDEX IF NOT EXISTS webauthn_sessions_expires_idx ON webauthn_sessions(expires_at);
