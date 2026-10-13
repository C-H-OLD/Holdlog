-- Identity storage only. No accounts, credentials, provider tokens or product fixtures are seeded.
-- 011 adds Asset FKs; 017 fills nullable installation registration fields.
CREATE SCHEMA holdlog;

CREATE TABLE holdlog.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL CHECK (display_name ~ '[^[:space:]]'),
  profile_image_id uuid,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE holdlog.external_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES holdlog.accounts(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject text NOT NULL CHECK (length(provider_subject) > 0),
  email text,
  UNIQUE (provider, provider_subject)
);
CREATE INDEX external_identities_account_idx ON holdlog.external_identities(account_id);

CREATE TABLE holdlog.login_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nonce_hash text NOT NULL CHECK (nonce_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
  consumed_at timestamptz
);
CREATE INDEX login_challenges_expiry_idx ON holdlog.login_challenges(expires_at);
CREATE TABLE holdlog.signup_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  provider text NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject text NOT NULL CHECK (length(provider_subject) > 0),
  email text,
  device_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
  consumed_at timestamptz
);
CREATE INDEX signup_proofs_expiry_idx ON holdlog.signup_proofs(expires_at);
CREATE INDEX signup_proofs_consumed_idx ON holdlog.signup_proofs(consumed_at) WHERE consumed_at IS NOT NULL;

CREATE TABLE holdlog.device_installations (
  id uuid PRIMARY KEY,
  platform text CHECK (platform IN ('ios', 'android')),
  account_id uuid REFERENCES holdlog.accounts(id) ON DELETE SET NULL,
  push_token_ciphertext text,
  push_token_hash text UNIQUE CHECK (push_token_hash ~ '^[a-f0-9]{64}$'),
  push_permission text CHECK (push_permission IN ('granted', 'denied', 'undetermined')),
  app_version text,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1 CHECK (version > 0),
  CHECK ((push_token_ciphertext IS NULL) = (push_token_hash IS NULL)),
  CHECK (push_token_hash IS NULL OR account_id IS NOT NULL)
);
CREATE INDEX device_installations_account_idx ON holdlog.device_installations(account_id);
CREATE TABLE holdlog.auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES holdlog.accounts(id) ON DELETE CASCADE,
  device_id uuid REFERENCES holdlog.device_installations(id) ON DELETE SET NULL,
  current_refresh_credential_id uuid,
  token_family_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  idle_expires_at timestamptz NOT NULL,
  absolute_expires_at timestamptz NOT NULL,
  rotated_at timestamptz,
  revoked_at timestamptz,
  CHECK (idle_expires_at <= absolute_expires_at AND expires_at <= absolute_expires_at),
  UNIQUE (id, token_family_id)
);
CREATE INDEX auth_sessions_account_revoked_idx ON holdlog.auth_sessions(account_id, revoked_at);
CREATE INDEX auth_sessions_device_idx ON holdlog.auth_sessions(device_id);
CREATE TABLE holdlog.refresh_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  token_family_id uuid NOT NULL,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  revoked_at timestamptz,
  FOREIGN KEY (session_id, token_family_id) REFERENCES holdlog.auth_sessions(id, token_family_id) ON DELETE CASCADE,
  UNIQUE (session_id, id)
);
CREATE INDEX refresh_credentials_expiry_idx ON holdlog.refresh_credentials(expires_at);
-- A session cannot point at another session's refresh credential. Deferred for atomic rotation/deletion.
ALTER TABLE holdlog.auth_sessions ADD CONSTRAINT current_refresh_belongs_to_session
  FOREIGN KEY (id, current_refresh_credential_id) REFERENCES holdlog.refresh_credentials(session_id, id)
  DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE holdlog.access_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES holdlog.auth_sessions(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz NOT NULL
);
CREATE INDEX access_credentials_session_idx ON holdlog.access_credentials(session_id);
CREATE INDEX access_credentials_expiry_idx ON holdlog.access_credentials(expires_at);

CREATE TABLE holdlog.service_administrators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id text NOT NULL UNIQUE CHECK (length(login_id) > 0),
  credential_hash text NOT NULL CHECK (credential_hash LIKE '$argon2id$%'),
  active boolean NOT NULL DEFAULT true,
  version integer NOT NULL DEFAULT 1 CHECK (version > 0)
);
CREATE TABLE holdlog.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  administrator_id uuid NOT NULL REFERENCES holdlog.service_administrators(id) ON DELETE CASCADE,
  session_secret_hash text NOT NULL UNIQUE CHECK (session_secret_hash ~ '^[a-f0-9]{64}$'),
  csrf_token_hash text NOT NULL CHECK (csrf_token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL CHECK (expires_at > created_at),
  revoked_at timestamptz
);
CREATE INDEX admin_sessions_administrator_revoked_idx ON holdlog.admin_sessions(administrator_id, revoked_at);
CREATE INDEX admin_sessions_expiry_idx ON holdlog.admin_sessions(expires_at);

-- No FK to a proof/account: minimal receipts outlive removed principals for the 24-hour replay boundary.
CREATE TABLE holdlog.request_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principal_scope text NOT NULL CHECK (principal_scope IN ('mobile', 'administrator', 'signup')),
  principal_id uuid NOT NULL,
  operation text NOT NULL CHECK (length(operation) > 0),
  key uuid NOT NULL,
  request_hash text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$'),
  state text NOT NULL CHECK (state IN ('processing', 'completed')),
  result_resource_id uuid,
  result_version integer CHECK (result_version > 0),
  result_status integer CHECK (result_status BETWEEN 100 AND 599),
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours') CHECK (expires_at > created_at),
  CHECK (state <> 'completed' OR result_status IS NOT NULL),
  UNIQUE (principal_scope, principal_id, operation, key)
);
CREATE INDEX request_receipts_expiry_idx ON holdlog.request_receipts(expires_at);
