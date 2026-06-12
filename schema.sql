-- SaiWei Sport Inquiry System - D1 Schema
-- Run: npx wrangler d1 execute saiwei-inquiries --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  buyer_type TEXT,
  product    TEXT,
  quantity   TEXT,
  market     TEXT,
  message    TEXT,
  source     TEXT DEFAULT 'website',
  status     TEXT DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiry_followups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id   INTEGER REFERENCES inquiries(id),
  note         TEXT,
  replied_by   TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
