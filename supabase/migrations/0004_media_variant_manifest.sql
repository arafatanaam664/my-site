alter table public.media_variants
  alter column storage_key drop not null,
  alter column mime_type drop not null,
  alter column width drop not null,
  alter column height drop not null,
  alter column bytes drop not null,
  alter column checksum_sha256 drop not null,
  add column if not exists status text not null default 'on_demand' check (status in ('on_demand', 'processed', 'failed')),
  add column if not exists processing_note text check (char_length(processing_note) <= 500);

alter table public.media_variants drop constraint if exists media_variants_storage_key_key;

create unique index if not exists media_variants_storage_key_unique_idx
  on public.media_variants (storage_key)
  where storage_key is not null;
