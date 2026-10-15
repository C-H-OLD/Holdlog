-- Identity storage only. No accounts, credentials, provider tokens or product fixtures are seeded.
-- 011 adds Asset FKs; 017 fills nullable installation registration fields.
-- SQLite: STRICT tables; UUIDs are lowercase TEXT, times are UTC RFC3339 TEXT with milliseconds and Z, booleans are 0/1.

CREATE TABLE accounts (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  -- Same 25 characters as JavaScript String.prototype.trim(), so the service check and this backstop agree.
  display_name TEXT NOT NULL CHECK (trim(display_name, char(9, 10, 11, 12, 13, 32, 160, 5760, 8192, 8193, 8194, 8195, 8196, 8197, 8198, 8199, 8200, 8201, 8202, 8232, 8233, 8239, 8287, 12288, 65279)) <> ''),
  profile_image_id TEXT CHECK (length(profile_image_id) = 36 AND profile_image_id NOT GLOB '*[^0-9a-f-]*'),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (updated_at IS strftime('%Y-%m-%dT%H:%M:%fZ', updated_at))
) STRICT;
CREATE TABLE external_identities (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE CHECK (length(account_id) = 36 AND account_id NOT GLOB '*[^0-9a-f-]*'),
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject TEXT NOT NULL CHECK (length(provider_subject) > 0),
  email TEXT,
  UNIQUE (provider, provider_subject)
) STRICT;
CREATE INDEX external_identities_account_idx ON external_identities(account_id);

CREATE TABLE login_challenges (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  nonce_hash TEXT NOT NULL CHECK (length(nonce_hash) = 64 AND nonce_hash NOT GLOB '*[^0-9a-f]*'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  consumed_at TEXT CHECK (consumed_at IS strftime('%Y-%m-%dT%H:%M:%fZ', consumed_at)),
  CHECK (expires_at > created_at)
) STRICT;
CREATE INDEX login_challenges_expiry_idx ON login_challenges(expires_at);
CREATE TABLE signup_proofs (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple')),
  provider_subject TEXT NOT NULL CHECK (length(provider_subject) > 0),
  email TEXT,
  device_id TEXT NOT NULL CHECK (length(device_id) = 36 AND device_id NOT GLOB '*[^0-9a-f-]*'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  consumed_at TEXT CHECK (consumed_at IS strftime('%Y-%m-%dT%H:%M:%fZ', consumed_at)),
  CHECK (expires_at > created_at)
) STRICT;
CREATE INDEX signup_proofs_expiry_idx ON signup_proofs(expires_at);
CREATE INDEX signup_proofs_consumed_idx ON signup_proofs(consumed_at) WHERE consumed_at IS NOT NULL;

-- id is the client's installation id (normalized to lowercase by the service), so it has no default.
CREATE TABLE device_installations (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  platform TEXT CHECK (platform IN ('ios', 'android')),
  account_id TEXT REFERENCES accounts(id) ON DELETE SET NULL CHECK (length(account_id) = 36 AND account_id NOT GLOB '*[^0-9a-f-]*'),
  push_token_ciphertext TEXT,
  push_token_hash TEXT UNIQUE CHECK (length(push_token_hash) = 64 AND push_token_hash NOT GLOB '*[^0-9a-f]*'),
  push_permission TEXT CHECK (push_permission IN ('granted', 'denied', 'undetermined')),
  app_version TEXT,
  last_seen_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (last_seen_at IS strftime('%Y-%m-%dT%H:%M:%fZ', last_seen_at)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  CHECK ((push_token_ciphertext IS NULL) = (push_token_hash IS NULL)),
  CHECK (push_token_hash IS NULL OR account_id IS NOT NULL)
) STRICT;
CREATE INDEX device_installations_account_idx ON device_installations(account_id);
CREATE TABLE auth_sessions (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE CHECK (length(account_id) = 36 AND account_id NOT GLOB '*[^0-9a-f-]*'),
  device_id TEXT REFERENCES device_installations(id) ON DELETE SET NULL CHECK (length(device_id) = 36 AND device_id NOT GLOB '*[^0-9a-f-]*'),
  current_refresh_credential_id TEXT CHECK (length(current_refresh_credential_id) = 36 AND current_refresh_credential_id NOT GLOB '*[^0-9a-f-]*'),
  token_family_id TEXT NOT NULL CHECK (length(token_family_id) = 36 AND token_family_id NOT GLOB '*[^0-9a-f-]*'),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  idle_expires_at TEXT NOT NULL CHECK (idle_expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', idle_expires_at)),
  absolute_expires_at TEXT NOT NULL CHECK (absolute_expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', absolute_expires_at)),
  rotated_at TEXT CHECK (rotated_at IS strftime('%Y-%m-%dT%H:%M:%fZ', rotated_at)),
  revoked_at TEXT CHECK (revoked_at IS strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at)),
  CHECK (idle_expires_at <= absolute_expires_at AND expires_at <= absolute_expires_at),
  UNIQUE (id, token_family_id),
  -- A session cannot point at another session's refresh credential. Deferred for atomic rotation/deletion.
  FOREIGN KEY (id, current_refresh_credential_id) REFERENCES refresh_credentials(session_id, id) DEFERRABLE INITIALLY DEFERRED
) STRICT;
CREATE INDEX auth_sessions_account_revoked_idx ON auth_sessions(account_id, revoked_at);
CREATE INDEX auth_sessions_device_idx ON auth_sessions(device_id);
CREATE TABLE refresh_credentials (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  session_id TEXT NOT NULL CHECK (length(session_id) = 36 AND session_id NOT GLOB '*[^0-9a-f-]*'),
  token_family_id TEXT NOT NULL CHECK (length(token_family_id) = 36 AND token_family_id NOT GLOB '*[^0-9a-f-]*'),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  used_at TEXT CHECK (used_at IS strftime('%Y-%m-%dT%H:%M:%fZ', used_at)),
  revoked_at TEXT CHECK (revoked_at IS strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at)),
  FOREIGN KEY (session_id, token_family_id) REFERENCES auth_sessions(id, token_family_id) ON DELETE CASCADE,
  UNIQUE (session_id, id)
) STRICT;
CREATE INDEX refresh_credentials_expiry_idx ON refresh_credentials(expires_at);
CREATE TABLE access_credentials (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  session_id TEXT NOT NULL REFERENCES auth_sessions(id) ON DELETE CASCADE CHECK (length(session_id) = 36 AND session_id NOT GLOB '*[^0-9a-f-]*'),
  token_hash TEXT NOT NULL UNIQUE CHECK (length(token_hash) = 64 AND token_hash NOT GLOB '*[^0-9a-f]*'),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at))
) STRICT;
CREATE INDEX access_credentials_session_idx ON access_credentials(session_id);
CREATE INDEX access_credentials_expiry_idx ON access_credentials(expires_at);

CREATE TABLE service_administrators (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  login_id TEXT NOT NULL UNIQUE CHECK (length(login_id) > 0),
  -- GLOB is case-sensitive; LIKE would also accept $ARGON2ID$.
  credential_hash TEXT NOT NULL CHECK (credential_hash GLOB '$argon2id$*'),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
) STRICT;
CREATE TABLE admin_sessions (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  administrator_id TEXT NOT NULL REFERENCES service_administrators(id) ON DELETE CASCADE CHECK (length(administrator_id) = 36 AND administrator_id NOT GLOB '*[^0-9a-f-]*'),
  session_secret_hash TEXT NOT NULL UNIQUE CHECK (length(session_secret_hash) = 64 AND session_secret_hash NOT GLOB '*[^0-9a-f]*'),
  csrf_token_hash TEXT NOT NULL CHECK (length(csrf_token_hash) = 64 AND csrf_token_hash NOT GLOB '*[^0-9a-f]*'),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  last_activity_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (last_activity_at IS strftime('%Y-%m-%dT%H:%M:%fZ', last_activity_at)),
  expires_at TEXT NOT NULL CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  revoked_at TEXT CHECK (revoked_at IS strftime('%Y-%m-%dT%H:%M:%fZ', revoked_at)),
  CHECK (expires_at > created_at)
) STRICT;
CREATE INDEX admin_sessions_administrator_revoked_idx ON admin_sessions(administrator_id, revoked_at);
CREATE INDEX admin_sessions_expiry_idx ON admin_sessions(expires_at);

-- No FK to a proof/account: minimal receipts outlive removed principals for the 24-hour replay boundary.
CREATE TABLE request_receipts (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  principal_scope TEXT NOT NULL CHECK (principal_scope IN ('mobile', 'administrator', 'signup')),
  principal_id TEXT NOT NULL CHECK (length(principal_id) = 36 AND principal_id NOT GLOB '*[^0-9a-f-]*'),
  operation TEXT NOT NULL CHECK (length(operation) > 0),
  "key" TEXT NOT NULL CHECK (length("key") = 36 AND "key" NOT GLOB '*[^0-9a-f-]*'),
  request_hash TEXT NOT NULL CHECK (length(request_hash) = 64 AND request_hash NOT GLOB '*[^0-9a-f]*'),
  state TEXT NOT NULL CHECK (state IN ('processing', 'completed')),
  result_resource_id TEXT CHECK (length(result_resource_id) = 36 AND result_resource_id NOT GLOB '*[^0-9a-f-]*'),
  result_version INTEGER CHECK (result_version > 0),
  result_status INTEGER CHECK (result_status BETWEEN 100 AND 599),
  error_code TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  expires_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+24 hours')) CHECK (expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', expires_at)),
  CHECK (expires_at > created_at),
  CHECK (state <> 'completed' OR result_status IS NOT NULL),
  UNIQUE (principal_scope, principal_id, operation, "key")
) STRICT;
CREATE INDEX request_receipts_expiry_idx ON request_receipts(expires_at);
