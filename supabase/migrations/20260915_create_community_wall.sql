create extension if not exists pgcrypto;

create table if not exists public.community_projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 2 and 100),
  builder_name text not null check (char_length(builder_name) between 2 and 80),
  builder_email text not null,
  short_description text not null check (char_length(short_description) between 20 and 800),
  category text not null check (category in ('Web', 'Mobile', 'AI', 'Backend', 'Data', 'DevTools', 'Other')),
  stack text[] not null default '{}',
  live_url text,
  repository_url text,
  moderation_status text not null default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'hidden')),
  featured boolean not null default false,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.community_project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.community_projects(id) on delete cascade,
  storage_path text not null unique,
  sort_order smallint not null check (sort_order between 0 and 2),
  created_at timestamptz not null default now(),
  unique(project_id, sort_order)
);

create table if not exists public.wall_activity (
  id bigint generated always as identity primary key,
  fingerprint text not null,
  action text not null check (action in ('submit', 'login')),
  successful boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists community_projects_public_index on public.community_projects(moderation_status, featured desc, created_at desc);
create index if not exists wall_activity_rate_limit_index on public.wall_activity(fingerprint, action, created_at desc);

alter table public.community_projects enable row level security;
alter table public.community_project_images enable row level security;
alter table public.wall_activity enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('community-projects', 'community-projects', true, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.touch_community_project()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_community_project on public.community_projects;
create trigger touch_community_project before update on public.community_projects for each row execute function public.touch_community_project();
