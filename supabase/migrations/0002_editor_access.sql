-- Editor access is opt-in: only email addresses in editor_allowlist obtain a publishing role.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'editor', 'author', 'analyst', 'viewer'));

create table public.editor_allowlist (
  email text primary key check (email = lower(email)),
  role text not null check (role in ('admin', 'editor', 'author', 'analyst')),
  created_at timestamptz not null default now()
);

alter table public.editor_allowlist enable row level security;

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  granted_role text;
begin
  select role into granted_role from public.editor_allowlist where email = lower(new.email);
  insert into public.profiles (id, display_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)), coalesce(granted_role, 'viewer'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_profile();

-- Before using the login page, insert the intended administrator email here in SQL Editor:
-- insert into public.editor_allowlist (email, role) values ('YOUR_EMAIL@example.com', 'admin');
