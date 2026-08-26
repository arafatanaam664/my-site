-- Public-safe platform settings. Secrets must never be stored in this table.
create table public.platform_settings (
  setting_key text primary key check (setting_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  value jsonb not null,
  visibility text not null check (visibility in ('public', 'admin')),
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.platform_setting_audit (
  id bigint generated always as identity primary key,
  setting_key text not null references public.platform_settings(setting_key) on delete cascade,
  previous_value jsonb,
  next_value jsonb not null,
  actor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

insert into public.platform_settings (setting_key, value, visibility) values
  ('site_notice', '{"enabled":false,"message":""}'::jsonb, 'public')
on conflict (setting_key) do nothing;

alter table public.platform_settings enable row level security;
alter table public.platform_setting_audit enable row level security;
create policy "public platform settings" on public.platform_settings for select using (visibility = 'public');
