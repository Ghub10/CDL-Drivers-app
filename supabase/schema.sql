-- ─────────────────────────────────────────────────────────────────────────────
-- CDL-Drivers — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Supabase Auth handles the `auth.users` table automatically.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable the pgcrypto extension for uuid_generate_v4()
create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type user_role as enum ('driver', 'recruiter');
create type cdl_class as enum ('A', 'B');
create type endorsement as enum ('H', 'N', 'T', 'P', 'S', 'X');
create type availability_status as enum ('actively_looking', 'open_to_offers');
create type employment_type as enum ('full_time', 'part_time');
create type subscription_tier as enum ('free', 'pro', 'team');
create type job_posting_status as enum ('open', 'filled', 'paused');

-- ── user_profiles (maps auth.users → role) ────────────────────────────────────

create table if not exists user_profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  created_at  timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "Users can read their own profile"
  on user_profiles for select using (auth.uid() = id);

create policy "Users can insert their own profile"
  on user_profiles for insert with check (auth.uid() = id);

-- ── driver_profiles ───────────────────────────────────────────────────────────

create table if not exists driver_profiles (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  name                    text not null default '',
  phone                   text not null default '',
  email                   text not null default '',
  license_number          text,
  cdl_classes             cdl_class[] not null default '{}',
  endorsements            endorsement[] not null default '{}',
  zip_code                text not null default '',
  city                    text not null default '',
  state                   text not null default '',
  availability_status     availability_status not null default 'actively_looking',
  availability_start_date text not null default '',
  employment_type         employment_type not null default 'full_time',
  resume_url              text,
  photo_url               text,
  portrait_gender         text,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

alter table driver_profiles enable row level security;

create policy "Drivers can manage their own profile"
  on driver_profiles for all using (auth.uid() = user_id);

create policy "Recruiters can read all driver profiles"
  on driver_profiles for select using (
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'recruiter'
    )
  );

-- ── recruiter_profiles ────────────────────────────────────────────────────────

create table if not exists recruiter_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  name              text not null default '',
  company_name      text not null default '',
  phone             text not null default '',
  -- Metro area (replaces hard-coded Salt Lake City)
  area_city         text not null default '',
  area_state        text not null default '',
  area_zip          text not null default '',
  -- Subscription
  subscription_tier subscription_tier not null default 'free',
  stripe_customer_id text,
  subscription_ends_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table recruiter_profiles enable row level security;

create policy "Recruiters can manage their own profile"
  on recruiter_profiles for all using (auth.uid() = user_id);

-- ── messages ─────────────────────────────────────────────────────────────────

create table if not exists messages (
  id           uuid primary key default gen_random_uuid(),
  sender_id    uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now(),
  -- Null until the recipient opens / reads the message.
  read_at      timestamptz,
  -- Deterministic thread key: always least_uuid + '_' + greatest_uuid so
  -- both participants share the same thread_id without a separate table.
  thread_id    text generated always as (
    least(sender_id::text, recipient_id::text)
    || '_' ||
    greatest(sender_id::text, recipient_id::text)
  ) stored
);

-- Fast thread lookup and ordered message retrieval within a thread.
create index if not exists messages_thread_id_created_at
  on messages (thread_id, created_at);

-- Efficient unread-count queries per recipient.
create index if not exists messages_recipient_read_at
  on messages (recipient_id, read_at)
  where read_at is null;

alter table messages enable row level security;

create policy "Users can read messages they are part of"
  on messages for select using (
    auth.uid() = sender_id or auth.uid() = recipient_id
  );

create policy "Users can send messages"
  on messages for insert with check (auth.uid() = sender_id);

-- Recipients can stamp read_at (and only read_at) on messages addressed to them.
create policy "Recipients can mark messages read"
  on messages for update using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

-- ── job_postings ─────────────────────────────────────────────────────────────

create table if not exists job_postings (
  id                    uuid primary key default gen_random_uuid(),
  recruiter_user_id     uuid not null references auth.users(id) on delete cascade,
  company_name          text not null,
  title                 text not null,
  city                  text not null,
  state                 text not null,
  description           text not null default '',
  cdl_classes_required  cdl_class[] not null default '{}',
  endorsements_required endorsement[] not null default '{}',
  employment_type       employment_type not null default 'full_time',
  pay_range_min         integer,
  pay_range_max         integer,
  start_date            text not null default '',
  status                job_posting_status not null default 'open',
  apply_email           text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table job_postings enable row level security;

create policy "Recruiters can manage their own job postings"
  on job_postings for all using (auth.uid() = recruiter_user_id);

create policy "Drivers can read open job postings"
  on job_postings for select using (
    status = 'open' and
    exists (
      select 1 from user_profiles
      where id = auth.uid() and role = 'driver'
    )
  );

-- ── saved_recruiter_searches ──────────────────────────────────────────────────

create table if not exists saved_recruiter_searches (
  id                  uuid primary key default gen_random_uuid(),
  recruiter_user_id   uuid not null references auth.users(id) on delete cascade,
  name                text not null,
  radius              integer not null default 50,
  cdl_classes         cdl_class[] not null default '{}',
  endorsements        endorsement[] not null default '{}',
  availability        availability_status,
  city                text not null,
  state               text not null,
  zip                 text not null,
  last_seen_at        timestamptz,
  created_at          timestamptz not null default now()
);

alter table saved_recruiter_searches enable row level security;

create policy "Recruiters can manage their own saved searches"
  on saved_recruiter_searches for all using (auth.uid() = recruiter_user_id);

-- ── updated_at trigger ────────────────────────────────────────────────────────

create or replace function handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger driver_profiles_updated_at
  before update on driver_profiles
  for each row execute procedure handle_updated_at();

create trigger recruiter_profiles_updated_at
  before update on recruiter_profiles
  for each row execute procedure handle_updated_at();

create trigger job_postings_updated_at
  before update on job_postings
  for each row execute procedure handle_updated_at();

-- ── Supabase Storage: resumes bucket ─────────────────────────────────────────
-- PRIVATE bucket. Drivers read their own file; recruiters read any resume
-- (the app opens them through short-lived signed links).
-- Each driver stores their file at {user_id}/resume.{ext}; upsert replaces it.
insert into storage.buckets (id, name, public)
  values ('resumes', 'resumes', false)
  on conflict (id) do nothing;

-- Drivers may upload / replace only their own resume.
create policy "Drivers upload own resume"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Drivers update own resume"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Drivers read own resume"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Recruiters read resumes"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and exists (select 1 from public.user_profiles where id = auth.uid() and role = 'recruiter')
  );
