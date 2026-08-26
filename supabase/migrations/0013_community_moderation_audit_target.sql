-- Reports use bigint identifiers while other community targets use UUIDs.
-- Store a textual target reference so every moderation decision can be audited accurately.
alter table public.community_moderation_actions
  alter column target_id type text using target_id::text;

create index if not exists community_moderation_target_idx
  on public.community_moderation_actions(target_type, target_id, created_at desc);
