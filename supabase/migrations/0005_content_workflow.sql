alter type public.content_status add value if not exists 'approved' before 'published';

alter table public.content_revisions
  add column if not exists seo_title text check (char_length(seo_title) <= 60),
  add column if not exists seo_description text check (char_length(seo_description) <= 160),
  add column if not exists canonical_url text,
  add column if not exists primary_media_id uuid references public.media_assets(id) on delete set null;

create table if not exists public.content_workflow_events (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  from_status public.content_status,
  to_status public.content_status not null,
  note text check (char_length(note) <= 500),
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists content_workflow_events_content_time_idx
  on public.content_workflow_events (content_id, created_at desc);

alter table public.content_workflow_events enable row level security;
