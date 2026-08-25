alter table public.notification_subscriptions
  add column if not exists push_p256dh text,
  add column if not exists push_auth text,
  add column if not exists topics text[] not null default array['content']::text[],
  add column if not exists last_sent_at timestamptz,
  add column if not exists last_error text check (char_length(last_error) <= 500);

alter table public.notification_subscriptions
  add constraint web_push_requires_keys check (
    channel <> 'web_push' or (push_p256dh is not null and push_auth is not null)
  );

create table if not exists public.notification_deliveries (
  id bigint generated always as identity primary key,
  subscription_id uuid not null references public.notification_subscriptions(id) on delete cascade,
  content_id uuid not null references public.content_items(id) on delete cascade,
  status text not null check (status in ('sent', 'failed', 'revoked', 'skipped')),
  detail text check (char_length(detail) <= 500),
  created_at timestamptz not null default now(),
  unique (subscription_id, content_id)
);

alter table public.notification_deliveries enable row level security;
