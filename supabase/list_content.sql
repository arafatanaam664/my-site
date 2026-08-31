-- Run in Supabase → SQL Editor after repair_and_inspect.sql.
-- Paste the result table back into chat (no secrets).

select id, kind, status, slug, title, left(coalesce(excerpt, ''), 80) as excerpt, published_at, updated_at
from public.content_items
order by updated_at desc;
