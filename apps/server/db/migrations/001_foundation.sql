-- Synthetic job effects and the generic job table; no product tables or personal data.
CREATE TABLE job_effects (
  job_id TEXT NOT NULL PRIMARY KEY CHECK (length(job_id) = 36 AND job_id NOT GLOB '*[^0-9a-f-]*'),
  completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (completed_at IS strftime('%Y-%m-%dT%H:%M:%fZ', completed_at))
) STRICT;

-- One row per delivered job key. running rows carry the current claim; finished rows keep only a fixed error category.
CREATE TABLE jobs (
  id TEXT NOT NULL PRIMARY KEY CHECK (length(id) = 36 AND id NOT GLOB '*[^0-9a-f-]*'),
  queue TEXT NOT NULL CHECK (length(queue) BETWEEN 1 AND 63 AND queue GLOB '[a-z]*' AND queue NOT GLOB '*[^a-z0-9-]*'),
  job_key TEXT NOT NULL UNIQUE CHECK (length(job_key) > 0),
  payload TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(payload)),
  state TEXT NOT NULL DEFAULT 'queued' CHECK (state IN ('queued', 'running', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts INTEGER NOT NULL CHECK (max_attempts >= 1),
  available_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (available_at IS strftime('%Y-%m-%dT%H:%M:%fZ', available_at)),
  lease_expires_at TEXT CHECK (lease_expires_at IS strftime('%Y-%m-%dT%H:%M:%fZ', lease_expires_at)),
  claim_id TEXT CHECK (length(claim_id) = 36 AND claim_id NOT GLOB '*[^0-9a-f-]*'),
  last_error_code TEXT CHECK (last_error_code IS NULL OR (length(last_error_code) BETWEEN 1 AND 64 AND last_error_code NOT GLOB '*[^A-Z0-9_]*')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) CHECK (created_at IS strftime('%Y-%m-%dT%H:%M:%fZ', created_at)),
  finished_at TEXT CHECK (finished_at IS strftime('%Y-%m-%dT%H:%M:%fZ', finished_at)),
  CHECK (attempts <= max_attempts),
  CHECK ((state = 'running') = (claim_id IS NOT NULL AND lease_expires_at IS NOT NULL)),
  CHECK ((state IN ('completed', 'failed')) = (finished_at IS NOT NULL))
) STRICT;
CREATE INDEX jobs_claim_idx ON jobs(queue, state, available_at);
