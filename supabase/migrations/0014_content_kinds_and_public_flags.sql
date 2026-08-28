-- Expand editorial kinds used by the public content engine.
alter type public.content_kind add value if not exists 'solution';
alter type public.content_kind add value if not exists 'faq';
alter type public.content_kind add value if not exists 'news';

insert into public.content_types (handle, title, is_public) values
  ('solution', 'حل', true),
  ('faq', 'أسئلة شائعة', true),
  ('news', 'خبر', false)
on conflict (handle) do update set is_public = excluded.is_public, title = excluded.title;

-- Sharing is a launch capability. Community remains off until enabled from admin.
update public.feature_flags
  set public_visible = true, enabled = true, updated_at = now()
  where flag = 'social_sharing';

update public.feature_flags
  set public_visible = true, updated_at = now()
  where flag = 'community';
