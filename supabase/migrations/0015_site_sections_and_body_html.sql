-- Hierarchical public sections managed from admin, plus HTML body for the rich editor.
create table public.site_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null check (slug ~ '^[a-z][a-z0-9-]{1,47}$'),
  title text not null check (char_length(title) between 2 and 100),
  description text,
  parent_id uuid references public.site_sections(id) on delete cascade,
  content_kind text check (content_kind is null or content_kind in ('article', 'guide', 'solution', 'faq', 'news', 'tool', 'page')),
  nav_order integer not null default 100,
  enabled boolean not null default false,
  public_visible boolean not null default false,
  system_key text unique,
  destination_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index site_sections_root_slug_idx on public.site_sections (slug) where parent_id is null;
create unique index site_sections_child_slug_idx on public.site_sections (parent_id, slug) where parent_id is not null;
create index site_sections_parent_order_idx on public.site_sections (parent_id, nav_order);

insert into public.site_sections (id, slug, title, description, parent_id, content_kind, nav_order, enabled, public_visible, system_key, destination_path) values
  ('a1c4e000-0000-4000-8000-000000000001', 'calendar', 'التقويم والمواعيد', 'التاريخ والتحويل والمحتوى المرتبط بالمواعيد: أخبار، أدلة، أدوات، حلول، ومقالات.', null, null, 10, true, true, 'calendar', '/calendar'),
  ('a1c4e000-0000-4000-8000-000000000101', 'news', 'الأخبار', 'أخبار قصيرة موثقة تُنشر بعد المراجعة التحريرية.', 'a1c4e000-0000-4000-8000-000000000001', 'news', 11, true, true, 'calendar-news', null),
  ('a1c4e000-0000-4000-8000-000000000102', 'guides', 'الأدلة', 'أدلة عملية خطوة بخطوة لتنفيذ مهمة واضحة.', 'a1c4e000-0000-4000-8000-000000000001', 'guide', 12, true, true, 'calendar-guides', null),
  ('a1c4e000-0000-4000-8000-000000000103', 'tools', 'الأدوات', 'أدوات حساب وتحويل تعمل داخل المتصفح أو عبر مصدر خادمي معلن.', 'a1c4e000-0000-4000-8000-000000000001', 'tool', 13, true, true, 'calendar-tools', null),
  ('a1c4e000-0000-4000-8000-000000000104', 'solutions', 'الحلول', 'حلول لمسائل متكررة تبدأ من مشكلة واضحة.', 'a1c4e000-0000-4000-8000-000000000001', 'solution', 14, true, true, 'calendar-solutions', null),
  ('a1c4e000-0000-4000-8000-000000000105', 'articles', 'المقالات', 'مقالات عربية منظمة تشرح الموضوع وتعرض مصادره.', 'a1c4e000-0000-4000-8000-000000000001', 'article', 15, true, true, 'calendar-articles', null),
  ('a1c4e000-0000-4000-8000-000000000002', 'community', 'المجتمع', 'أسئلة ونقاش يُفتح للعامة فقط بعد تفعيله من لوحة التحكم.', null, null, 80, false, true, 'community', '/community')
on conflict (id) do nothing;

alter table public.content_items
  add column if not exists hub_id uuid references public.site_sections(id) on delete set null,
  add column if not exists section_id uuid references public.site_sections(id) on delete set null,
  add column if not exists body_html text;

alter table public.content_revisions
  add column if not exists body_html text,
  add column if not exists hub_id uuid,
  add column if not exists section_id uuid;

create index if not exists content_items_hub_idx on public.content_items(hub_id);
create index if not exists content_items_section_idx on public.content_items(section_id);

alter table public.site_sections enable row level security;
create policy "public enabled sections" on public.site_sections for select using (enabled = true and public_visible = true);
