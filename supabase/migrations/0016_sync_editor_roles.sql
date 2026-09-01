-- Keep allowlisted accounts editorial, and bootstrap the first user if nobody can publish yet.
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
