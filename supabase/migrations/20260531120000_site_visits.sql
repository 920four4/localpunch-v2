-- Site-visit tracking for the daily Telegram digest (not tenant-scoped).
-- One row per unique visitor per UTC day, written by the service-role beacon
-- at /api/track/view and read by the service-role daily-digest cron.

create table if not exists site_visits (
  id            uuid primary key default gen_random_uuid(),
  day           date not null default (now() at time zone 'utc')::date,
  visitor_hash  text not null,
  first_path    text,
  created_at    timestamptz not null default now(),
  unique (day, visitor_hash)
);

create index if not exists site_visits_day_idx on site_visits(day);

alter table site_visits enable row level security;
-- No policies: written + read only by the service role. Never exposed to users.
