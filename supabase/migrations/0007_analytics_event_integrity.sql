create index if not exists page_events_session_path_type_time_idx
  on public.page_events (session_hash, path, event_type, occurred_at desc);
