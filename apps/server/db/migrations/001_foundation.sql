-- Synthetic job effects only; no product tables or personal data.
CREATE TABLE holdlog_foundation.job_effects (
  job_id uuid PRIMARY KEY,
  completed_at timestamptz NOT NULL DEFAULT now()
);
