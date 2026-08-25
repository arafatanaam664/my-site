alter table public.media_assets
  add column if not exists checksum_sha256 text check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  add column if not exists processing_status text not null default 'original_only' check (processing_status in ('original_only', 'processed', 'failed')),
  add column if not exists processing_note text check (char_length(processing_note) <= 500);

create index if not exists media_assets_checksum_idx on public.media_assets (checksum_sha256);

create table if not exists public.media_variants (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_assets(id) on delete cascade,
  variant_key text not null check (variant_key in ('hero_1200', 'standard_768', 'compact_480', 'og_1200x630')),
  storage_key text not null unique,
  public_url text,
  mime_type text not null check (mime_type in ('image/avif', 'image/webp', 'image/jpeg')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  bytes integer not null check (bytes > 0),
  checksum_sha256 text not null check (checksum_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  unique (media_id, variant_key)
);

alter table public.media_variants enable row level security;

create policy "published media variants are public" on public.media_variants
  for select using (
    exists (
      select 1 from public.content_media cm
      join public.content_items ci on ci.id = cm.content_id
      where cm.media_id = media_variants.media_id
        and ci.status = 'published'
        and ci.published_at <= now()
    )
  );
