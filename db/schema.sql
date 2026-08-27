-- SmallSpace Home — newsletter subscriber store
-- Run once in the Neon SQL editor (https://console.neon.tech → your project → SQL Editor).
-- Safe to re-run: every statement is idempotent.

create table if not exists subscribers (
  id               bigint generated always as identity primary key,
  email            text        not null unique,
  status           text        not null default 'pending'
                                check (status in ('pending', 'active', 'unsubscribed')),
  token            text        not null unique,
  source           text,                         -- where they signed up: 'footer', 'post', ...
  consent_ip       text,                         -- CASL: proof-of-consent record
  consent_ua       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  confirmed_at     timestamptz,                  -- set when they click the confirm link (express consent)
  unsubscribed_at  timestamptz
);

create index if not exists subscribers_status_idx on subscribers (status);
create index if not exists subscribers_created_at_idx on subscribers (created_at);

-- Optional: log of sent issues, used by the Phase 2 broadcast route.
create table if not exists issues (
  id            bigint generated always as identity primary key,
  slug          text        not null unique,     -- e.g. '001-under-bed-storage'
  subject       text        not null,
  sent_at       timestamptz,
  recipient_count integer   not null default 0,
  created_at    timestamptz not null default now()
);
