-- Alshafra core schema. Run in Supabase SQL Editor after review.
create extension if not exists pgcrypto;

create type public.content_kind as enum ('article', 'guide', 'page', 'tool');
create type public.content_status as enum ('draft', 'in_review', 'published', 'archived');
create type public.source_kind as enum ('official', 'primary', 'secondary');
create type public.media_kind as enum ('image');
create type public.notification_channel as enum ('email', 'web_push');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor' check (role in ('admin', 'editor', 'author', 'analyst')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind public.content_kind not null,
  status public.content_status not null default 'draft',
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 15 and 160),
  excerpt text check (char_length(excerpt) <= 320),
  body_markdown text,
  seo_title text check (char_length(seo_title) <= 60),
  seo_description text check (char_length(seo_description) <= 160),
  canonical_url text,
  primary_media_id uuid,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  constraint published_content_requires_date check (status <> 'published' or published_at is not null)
);

create table public.content_revisions (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  status public.content_status not null,
  title text not null,
  excerpt text,
  body_markdown text,
  note text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique check (url ~ '^https://'),
  kind public.source_kind not null,
  publisher text,
  published_at date,
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.content_sources (
  content_id uuid not null references public.content_items(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  note text,
  primary key (content_id, source_id)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null default 'image',
  storage_key text not null unique,
  public_url text,
  alt_text text not null check (char_length(alt_text) between 5 and 180),
  caption text,
  mime_type text not null check (mime_type in ('image/avif', 'image/webp', 'image/jpeg', 'image/png')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes integer not null check (bytes > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.content_items add constraint content_primary_media_fk foreign key (primary_media_id) references public.media_assets(id) on delete set null;

create table public.content_media (
  content_id uuid not null references public.content_items(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  placement text not null check (placement in ('primary', 'inline')),
  position integer not null default 0 check (position >= 0),
  primary key (content_id, media_id)
);

create table public.page_events (
  id bigint generated always as identity primary key,
  content_id uuid references public.content_items(id) on delete set null,
  path text not null check (path like '/%'),
  event_type text not null check (event_type in ('page_view', 'read_25', 'read_50', 'read_75', 'read_complete', 'tool_use')),
  occurred_at timestamptz not null default now(),
  anonymous_day_hash text not null,
  session_hash text,
  duration_seconds integer check (duration_seconds is null or duration_seconds between 0 and 7200)
);

create index page_events_path_time_idx on public.page_events(path, occurred_at desc);
create index page_events_content_time_idx on public.page_events(content_id, occurred_at desc);

create table public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  channel public.notification_channel not null,
  destination text not null,
  consent_version text not null,
  consented_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (channel, destination)
);

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_revisions enable row level security;
alter table public.sources enable row level security;
alter table public.content_sources enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_media enable row level security;
alter table public.page_events enable row level security;
alter table public.notification_subscriptions enable row level security;

create policy "published content is public" on public.content_items
  for select using (status = 'published' and published_at <= now());
create policy "published sources are public" on public.sources
  for select using (exists (select 1 from public.content_sources cs join public.content_items ci on ci.id = cs.content_id where cs.source_id = sources.id and ci.status = 'published' and ci.published_at <= now()));
create policy "published content media is public" on public.content_media
  for select using (exists (select 1 from public.content_items ci where ci.id = content_media.content_id and ci.status = 'published' and ci.published_at <= now()));
create policy "published media assets are public" on public.media_assets
  for select using (exists (select 1 from public.content_media cm join public.content_items ci on ci.id = cm.content_id where cm.media_id = media_assets.id and ci.status = 'published' and ci.published_at <= now()));

-- No public insert/update policies are created. Server-side workflows use the secret key,
-- and authenticated administration policies are added with the admin interface migration.
