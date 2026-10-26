-- Contact form submissions. Same schema as website v7, so existing data can be imported.
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY NOT NULL,
  -- Generated in the browser; makes retries idempotent.
  submission_id TEXT NOT NULL,
  -- Milliseconds since the Unix epoch.
  created_at INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  -- JSON array of service ids, e.g. ["booking","crm"].
  services TEXT NOT NULL,
  context TEXT NOT NULL,
  brief TEXT NOT NULL,
  timeline TEXT NOT NULL,
  language TEXT NOT NULL,
  -- Daily-rotating hash of the visitor, for rate limiting.
  rate_key TEXT NOT NULL
);

CREATE UNIQUE INDEX inquiries_submission_id ON inquiries (submission_id);
CREATE INDEX inquiries_created_at ON inquiries (created_at);
CREATE INDEX inquiries_rate_key ON inquiries (rate_key, created_at);
