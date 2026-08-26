-- Shared platform foundations. New capabilities are data-ready but remain off until their own UI, RLS, moderation and acceptance tests exist.
create table public.content_types (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique check (handle ~ '^[a-z][a-z0-9_]{1,47}$'),
  title text not null check (char_length(title) between 2 and 80),
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.content_types (handle, title, is_public) values
  ('article', 'مقال', true), ('guide', 'دليل', true), ('tool', 'أداة', true), ('page', 'صفحة', false),
  ('solution', 'حل', false), ('news', 'خبر', false), ('trend', 'موضوع صاعد', false), ('faq', 'أسئلة شائعة', false),
  ('comparison', 'مقارنة', false), ('opportunity', 'فرصة', false), ('place', 'مكان', false), ('product', 'منتج', false),
  ('question', 'سؤال', false), ('discussion', 'نقاش', false)
on conflict (handle) do nothing;

alter table public.content_items add column if not exists content_type_id uuid references public.content_types(id) on delete restrict;
update public.content_items item set content_type_id = type.id from public.content_types type where type.handle = item.kind::text and item.content_type_id is null;
create index if not exists content_items_content_type_idx on public.content_items(content_type_id);

create table public.content_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 100),
  description text,
  parent_id uuid references public.content_categories(id) on delete set null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_category_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  category_id uuid not null references public.content_categories(id) on delete cascade,
  primary key (content_id, category_id)
);

create table public.content_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 80),
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.content_tag_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.content_tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

create table public.entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 120),
  entity_kind text not null check (entity_kind in ('application', 'service', 'organization', 'topic', 'device', 'place', 'product')),
  summary text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_entity_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  primary key (content_id, entity_id)
);

create table public.feature_flags (
  flag text primary key check (flag ~ '^[a-z][a-z0-9_]{1,63}$'),
  label text not null,
  enabled boolean not null default false,
  public_visible boolean not null default false,
  config jsonb not null default '{}'::jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

insert into public.feature_flags (flag, label, enabled, public_visible) values
  ('content_core', 'المحتوى العام', true, true),
  ('tools_core', 'الأدوات العامة', true, true),
  ('community', 'المجتمع والأسئلة', false, false),
  ('member_accounts', 'حسابات الأعضاء', false, false),
  ('comments', 'التعليقات', false, false),
  ('opportunities', 'الفرص والمنح', false, false),
  ('social_sharing', 'مشاركة المحتوى', false, false),
  ('social_publishing', 'النشر الاجتماعي', false, false),
  ('automation', 'الأتمتة', false, false),
  ('scheduled_publishing', 'النشر المجدول', false, false),
  ('ai_features', 'ميزات الذكاء الاصطناعي', false, false)
on conflict (flag) do nothing;

create table public.feature_flag_audit (
  id bigint generated always as identity primary key,
  flag text not null references public.feature_flags(flag) on delete cascade,
  previous_enabled boolean,
  next_enabled boolean not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type ~ '^[a-z][a-z0-9_.]{2,127}$'),
  aggregate_type text not null check (aggregate_type ~ '^[a-z][a-z0-9_]{1,63}$'),
  aggregate_id uuid,
  payload jsonb not null default '{}'::jsonb,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index platform_events_aggregate_time_idx on public.platform_events(aggregate_type, aggregate_id, created_at desc);
create index platform_events_type_time_idx on public.platform_events(event_type, created_at desc);

alter table public.content_types enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_category_assignments enable row level security;
alter table public.content_tags enable row level security;
alter table public.content_tag_assignments enable row level security;
alter table public.entities enable row level security;
alter table public.content_entity_assignments enable row level security;
alter table public.feature_flags enable row level security;
alter table public.feature_flag_audit enable row level security;
alter table public.platform_events enable row level security;

create policy "public content types" on public.content_types for select using (is_public);
create policy "public categories" on public.content_categories for select using (is_public);
create policy "public tags" on public.content_tags for select using (is_public);
create policy "public entities" on public.entities for select using (is_public);
