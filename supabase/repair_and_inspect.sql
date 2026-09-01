-- Alshafra: complete missing schema, seed navigation, grant admin.
-- Run in Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

create extension if not exists pgcrypto;

do $$ begin
  create type public.content_kind as enum ('article', 'guide', 'page', 'tool');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.content_status as enum ('draft', 'in_review', 'published', 'archived');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.source_kind as enum ('official', 'primary', 'secondary');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.media_kind as enum ('image');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.notification_channel as enum ('email', 'web_push');
exception when duplicate_object then null;
end $$;

alter type public.content_kind add value if not exists 'solution';
alter type public.content_kind add value if not exists 'faq';
alter type public.content_kind add value if not exists 'news';
alter type public.content_status add value if not exists 'approved';

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'editor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'editor', 'author', 'analyst', 'viewer'));

create table if not exists public.editor_allowlist (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('admin', 'editor', 'author', 'analyst')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  kind public.content_kind not null,
  status public.content_status not null default 'draft',
  slug text not null unique,
  title text not null,
  excerpt text,
  body_markdown text,
  seo_title text,
  seo_description text,
  canonical_url text,
  primary_media_id uuid,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null
);
alter table public.content_items
  add column if not exists content_type_id uuid,
  add column if not exists hub_id uuid,
  add column if not exists section_id uuid,
  add column if not exists body_html text;

create table if not exists public.content_revisions (
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
alter table public.content_revisions
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists canonical_url text,
  add column if not exists primary_media_id uuid,
  add column if not exists body_html text,
  add column if not exists hub_id uuid,
  add column if not exists section_id uuid;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null unique,
  kind public.source_kind not null,
  publisher text,
  published_at date,
  accessed_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.content_sources (
  content_id uuid not null references public.content_items(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  note text,
  primary key (content_id, source_id)
);
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  kind public.media_kind not null default 'image',
  storage_key text not null unique,
  public_url text,
  alt_text text not null,
  caption text,
  mime_type text not null,
  width integer not null,
  height integer not null,
  bytes integer not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.media_assets
  add column if not exists checksum_sha256 text,
  add column if not exists processing_status text not null default 'original_only',
  add column if not exists processing_note text;

create table if not exists public.content_media (
  content_id uuid not null references public.content_items(id) on delete cascade,
  media_id uuid not null references public.media_assets(id) on delete cascade,
  placement text not null,
  position integer not null default 0,
  primary key (content_id, media_id)
);
create table if not exists public.page_events (
  id bigint generated always as identity primary key,
  content_id uuid references public.content_items(id) on delete set null,
  path text not null,
  event_type text not null,
  occurred_at timestamptz not null default now(),
  anonymous_day_hash text not null,
  session_hash text,
  duration_seconds integer
);
create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  channel public.notification_channel not null,
  destination text not null,
  consent_version text not null,
  consented_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (channel, destination)
);
alter table public.notification_subscriptions
  add column if not exists push_p256dh text,
  add column if not exists push_auth text,
  add column if not exists topics text[] not null default array['content']::text[],
  add column if not exists last_sent_at timestamptz,
  add column if not exists last_error text;

create table if not exists public.content_workflow_events (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.content_items(id) on delete cascade,
  from_status public.content_status,
  to_status public.content_status not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.media_variants (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  variant_key text not null,
  storage_key text,
  public_url text,
  mime_type text,
  width integer,
  height integer,
  bytes integer,
  checksum_sha256 text,
  created_at timestamptz not null default now()
);
alter table public.media_variants
  add column if not exists status text not null default 'on_demand',
  add column if not exists processing_note text;

create table if not exists public.content_types (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique,
  title text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.content_types (handle, title, is_public) values
  ('article', 'مقال', true), ('guide', 'دليل', true), ('tool', 'أداة', true), ('page', 'صفحة', false),
  ('solution', 'حل', true), ('news', 'خبر', true), ('trend', 'موضوع صاعد', false), ('faq', 'أسئلة شائعة', true),
  ('comparison', 'مقارنة', false), ('opportunity', 'فرصة', false), ('place', 'مكان', false), ('product', 'منتج', false),
  ('question', 'سؤال', false), ('discussion', 'نقاش', false)
on conflict (handle) do update set is_public = excluded.is_public, title = excluded.title;

create table if not exists public.content_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  parent_id uuid references public.content_categories(id) on delete set null,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.content_category_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  category_id uuid not null references public.content_categories(id) on delete cascade,
  primary key (content_id, category_id)
);
create table if not exists public.content_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.content_tag_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.content_tags(id) on delete cascade,
  primary key (content_id, tag_id)
);
create table if not exists public.entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  entity_kind text not null,
  summary text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.content_entity_assignments (
  content_id uuid not null references public.content_items(id) on delete cascade,
  entity_id uuid not null references public.entities(id) on delete cascade,
  primary key (content_id, entity_id)
);
create table if not exists public.feature_flags (
  flag text primary key,
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
  ('community', 'المجتمع والأسئلة', false, true),
  ('member_accounts', 'حسابات الأعضاء', false, false),
  ('comments', 'التعليقات', false, false),
  ('opportunities', 'الفرص والمنح', false, false),
  ('social_sharing', 'مشاركة المحتوى', true, true),
  ('social_publishing', 'النشر الاجتماعي', false, false),
  ('automation', 'الأتمتة', false, false),
  ('scheduled_publishing', 'النشر المجدول', false, false),
  ('ai_features', 'ميزات الذكاء الاصطناعي', false, false)
on conflict (flag) do nothing;
update public.feature_flags set public_visible = true, enabled = true where flag = 'social_sharing';
update public.feature_flags set public_visible = true where flag = 'community';

create table if not exists public.feature_flag_audit (
  id bigint generated always as identity primary key,
  flag text not null references public.feature_flags(flag) on delete cascade,
  previous_enabled boolean,
  next_enabled boolean not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid,
  payload jsonb not null default '{}'::jsonb,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.platform_settings (
  setting_key text primary key,
  value jsonb not null,
  visibility text not null,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.platform_settings (setting_key, value, visibility) values
  ('site_notice', '{"enabled":false,"message":""}'::jsonb, 'public')
on conflict (setting_key) do nothing;
create table if not exists public.platform_setting_audit (
  id bigint generated always as identity primary key,
  setting_key text not null references public.platform_settings(setting_key) on delete cascade,
  previous_value jsonb,
  next_value jsonb not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  description text,
  parent_id uuid references public.site_sections(id) on delete cascade,
  content_kind text,
  nav_order integer not null default 100,
  enabled boolean not null default false,
  public_visible boolean not null default false,
  system_key text unique,
  destination_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
insert into public.site_sections (id, slug, title, description, parent_id, content_kind, nav_order, enabled, public_visible, system_key, destination_path) values
  ('a1c4e000-0000-4000-8000-000000000001', 'calendar', 'التقويم والمواعيد', 'التاريخ والتحويل والمحتوى المرتبط بالمواعيد.', null, null, 10, true, true, 'calendar', '/calendar'),
  ('a1c4e000-0000-4000-8000-000000000101', 'news', 'الأخبار', 'أخبار قصيرة موثقة.', 'a1c4e000-0000-4000-8000-000000000001', 'news', 11, true, true, 'calendar-news', null),
  ('a1c4e000-0000-4000-8000-000000000102', 'guides', 'الأدلة', 'أدلة عملية خطوة بخطوة.', 'a1c4e000-0000-4000-8000-000000000001', 'guide', 12, true, true, 'calendar-guides', null),
  ('a1c4e000-0000-4000-8000-000000000103', 'tools', 'الأدوات', 'أدوات حساب وتحويل.', 'a1c4e000-0000-4000-8000-000000000001', 'tool', 13, true, true, 'calendar-tools', null),
  ('a1c4e000-0000-4000-8000-000000000104', 'solutions', 'الحلول', 'حلول لمسائل متكررة.', 'a1c4e000-0000-4000-8000-000000000001', 'solution', 14, true, true, 'calendar-solutions', null),
  ('a1c4e000-0000-4000-8000-000000000105', 'articles', 'المقالات', 'مقالات عربية منظمة.', 'a1c4e000-0000-4000-8000-000000000001', 'article', 15, true, true, 'calendar-articles', null),
  ('a1c4e000-0000-4000-8000-000000000002', 'community', 'المجتمع', 'أسئلة ونقاش يُفتح بعد التفعيل.', null, null, 80, false, true, 'community', '/community')
on conflict (id) do nothing;

create table if not exists public.member_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text,
  reputation integer not null default 0,
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.member_profiles(id) on delete restrict,
  slug text not null unique,
  title text not null,
  body_markdown text not null,
  status text not null default 'pending',
  answer_count integer not null default 0,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.community_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.community_questions(id) on delete cascade,
  author_id uuid not null references public.member_profiles(id) on delete restrict,
  body_markdown text not null,
  status text not null default 'pending',
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.community_votes (
  voter_id uuid not null references public.member_profiles(id) on delete cascade,
  target_type text not null,
  target_id uuid not null,
  value smallint not null,
  created_at timestamptz not null default now(),
  primary key (voter_id, target_type, target_id)
);
create table if not exists public.community_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.member_profiles(id) on delete restrict,
  target_type text not null,
  target_id uuid not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create table if not exists public.community_moderation_actions (
  id bigint generated always as identity primary key,
  moderator_id uuid references public.profiles(id) on delete set null,
  target_type text not null,
  target_id text not null,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  display_name text not null,
  external_account_ref text,
  connection_status text not null default 'disconnected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.social_post_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  provider text,
  body_template text not null,
  enabled boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create table if not exists public.social_outbox (
  id uuid primary key default gen_random_uuid(),
  content_id uuid references public.content_items(id) on delete set null,
  account_id uuid references public.social_accounts(id) on delete set null,
  template_id uuid references public.social_post_templates(id) on delete set null,
  body_snapshot text not null,
  destination_url text,
  status text not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.social_delivery_log (
  id bigint generated always as identity primary key,
  outbox_id uuid not null references public.social_outbox(id) on delete cascade,
  action text not null,
  note text,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.notification_deliveries (
  id bigint generated always as identity primary key,
  subscription_id uuid not null references public.notification_subscriptions(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  status text not null,
  detail text,
  created_at timestamptz not null default now(),
  unique (subscription_id, content_id)
);

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare granted_role text;
begin
  select role into granted_role from public.editor_allowlist where email = lower(new.email);
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), coalesce(granted_role, 'viewer'))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_profile();

insert into public.editor_allowlist (email, role)
values ('arafat.anaam1@gmail.com', 'admin')
on conflict (email) do update set role = 'admin';

update public.profiles p
set role = a.role, updated_at = now()
from auth.users u
join public.editor_allowlist a on a.email = lower(u.email)
where p.id = u.id
  and p.role not in ('admin', 'editor', 'author')
  and a.role in ('admin', 'editor', 'author');

insert into public.profiles (id, display_name, role)
select u.id, coalesce(u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)), a.role
from auth.users u
join public.editor_allowlist a on a.email = lower(u.email)
where a.role in ('admin', 'editor', 'author')
on conflict (id) do update set role = excluded.role, updated_at = now();

update public.profiles
set role = 'admin', updated_at = now()
where id = (select id from auth.users order by created_at asc limit 1)
  and not exists (select 1 from public.profiles where role in ('admin', 'editor', 'author'));

alter table public.profiles enable row level security;
alter table public.editor_allowlist enable row level security;
alter table public.content_items enable row level security;
alter table public.content_revisions enable row level security;
alter table public.sources enable row level security;
alter table public.content_sources enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_media enable row level security;
alter table public.page_events enable row level security;
alter table public.notification_subscriptions enable row level security;
alter table public.content_workflow_events enable row level security;
alter table public.media_variants enable row level security;
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
alter table public.platform_settings enable row level security;
alter table public.platform_setting_audit enable row level security;
alter table public.site_sections enable row level security;
alter table public.member_profiles enable row level security;
alter table public.community_questions enable row level security;
alter table public.community_answers enable row level security;
alter table public.community_votes enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_moderation_actions enable row level security;
alter table public.social_accounts enable row level security;
alter table public.social_post_templates enable row level security;
alter table public.social_outbox enable row level security;
alter table public.social_delivery_log enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "published content is public" on public.content_items;
create policy "published content is public" on public.content_items
  for select using (status = 'published' and published_at <= now());
drop policy if exists "public enabled sections" on public.site_sections;
create policy "public enabled sections" on public.site_sections
  for select using (enabled = true and public_visible = true);
drop policy if exists "public platform settings" on public.platform_settings;
create policy "public platform settings" on public.platform_settings
  for select using (visibility = 'public');
drop policy if exists "public content types" on public.content_types;
create policy "public content types" on public.content_types for select using (is_public);

-- Report: copy this result table back into chat (no secrets).
select
  (select count(*) from information_schema.tables where table_schema = 'public') as public_tables,
  (select count(*) from public.editor_allowlist where email = 'arafat.anaam1@gmail.com') as admin_allowlisted,
  (select count(*) from public.site_sections) as sections,
  (select count(*) from public.feature_flags) as flags,
  (select count(*) from public.content_items) as content_items,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='content_items' and column_name='body_html') as has_body_html,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='content_items' and column_name='hub_id') as has_hub_id,
  exists(select 1 from information_schema.tables where table_schema='public' and table_name='site_sections') as has_site_sections;
