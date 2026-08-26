-- Community remains disabled by feature flag until its public UI, moderation flow and acceptance tests are complete.
create table public.member_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  bio text check (char_length(bio) <= 500),
  reputation integer not null default 0 check (reputation >= 0),
  is_suspended boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_questions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.member_profiles(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 15 and 180),
  body_markdown text not null check (char_length(body_markdown) between 80 and 50000),
  status text not null default 'pending' check (status in ('pending', 'published', 'locked', 'archived', 'hidden')),
  answer_count integer not null default 0 check (answer_count >= 0),
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.community_questions(id) on delete cascade,
  author_id uuid not null references public.member_profiles(id) on delete restrict,
  body_markdown text not null check (char_length(body_markdown) between 40 and 30000),
  status text not null default 'pending' check (status in ('pending', 'published', 'hidden')),
  score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.community_votes (
  voter_id uuid not null references public.member_profiles(id) on delete cascade,
  target_type text not null check (target_type in ('question', 'answer')),
  target_id uuid not null,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz not null default now(),
  primary key (voter_id, target_type, target_id)
);

create table public.community_reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.member_profiles(id) on delete restrict,
  target_type text not null check (target_type in ('question', 'answer', 'member')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'under_review', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.community_moderation_actions (
  id bigint generated always as identity primary key,
  moderator_id uuid references public.profiles(id) on delete set null,
  target_type text not null check (target_type in ('question', 'answer', 'member', 'report')),
  target_id uuid not null,
  action text not null check (action in ('publish', 'hide', 'lock', 'archive', 'suspend', 'restore', 'resolve_report', 'dismiss_report')),
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create index community_questions_status_time_idx on public.community_questions(status, created_at desc);
create index community_answers_question_status_idx on public.community_answers(question_id, status, created_at asc);
create index community_reports_status_time_idx on public.community_reports(status, created_at asc);

alter table public.member_profiles enable row level security;
alter table public.community_questions enable row level security;
alter table public.community_answers enable row level security;
alter table public.community_votes enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_moderation_actions enable row level security;

create policy "public member profiles" on public.member_profiles for select using (not is_suspended);
create policy "members create own profile" on public.member_profiles for insert with check (auth.uid() = id);
create policy "members update own profile" on public.member_profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "public published questions" on public.community_questions for select using (status = 'published');
create policy "members submit own questions" on public.community_questions for insert with check (auth.uid() = author_id and status = 'pending');
create policy "members edit own pending questions" on public.community_questions for update using (auth.uid() = author_id and status = 'pending') with check (auth.uid() = author_id and status = 'pending');
create policy "public published answers" on public.community_answers for select using (status = 'published');
create policy "members submit own answers" on public.community_answers for insert with check (auth.uid() = author_id and status = 'pending');
create policy "members edit own pending answers" on public.community_answers for update using (auth.uid() = author_id and status = 'pending') with check (auth.uid() = author_id and status = 'pending');
create policy "members manage own votes" on public.community_votes for all using (auth.uid() = voter_id) with check (auth.uid() = voter_id);
create policy "members create reports" on public.community_reports for insert with check (auth.uid() = reporter_id);
