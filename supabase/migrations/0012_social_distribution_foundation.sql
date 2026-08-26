-- Manual distribution foundation. No provider token, API secret, scheduler or automatic send is stored here.
create table public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('x', 'facebook', 'instagram', 'linkedin', 'telegram', 'whatsapp_channel', 'other')),
  display_name text not null check (char_length(display_name) between 2 and 120),
  external_account_ref text check (char_length(external_account_ref) <= 240),
  connection_status text not null default 'disconnected' check (connection_status in ('disconnected', 'ready', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_account_ref)
);

create table public.social_post_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 100),
  provider text check (provider is null or provider in ('x', 'facebook', 'instagram', 'linkedin', 'telegram', 'whatsapp_channel', 'other')),
  body_template text not null check (char_length(body_template) between 20 and 5000),
  enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.social_outbox (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content_items(id) on delete set null,
  account_id uuid references public.social_accounts(id) on delete set null,
  template_id uuid references public.social_post_templates(id) on delete set null,
  body_snapshot text not null check (char_length(body_snapshot) between 1 and 5000),
  destination_url text check (destination_url is null or destination_url ~ '^https://'),
  status text not null default 'draft' check (status in ('draft', 'ready', 'copied', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_delivery_log (
  id bigint generated always as identity primary key,
  outbox_id uuid not null references public.social_outbox(id) on delete cascade,
  action text not null check (action in ('created', 'copied_for_manual_publish', 'marked_published', 'cancelled', 'failed')),
  note text check (char_length(note) <= 1000),
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index social_outbox_status_time_idx on public.social_outbox(status, created_at desc);
create index social_delivery_log_outbox_time_idx on public.social_delivery_log(outbox_id, created_at desc);

alter table public.social_accounts enable row level security;
alter table public.social_post_templates enable row level security;
alter table public.social_outbox enable row level security;
alter table public.social_delivery_log enable row level security;
