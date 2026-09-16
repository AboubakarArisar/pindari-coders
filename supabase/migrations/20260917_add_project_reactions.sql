create table if not exists public.community_project_reactions (
  project_id uuid not null references public.community_projects(id) on delete cascade,
  fingerprint text not null check (char_length(fingerprint) = 64),
  reaction text not null check (reaction in ('love', 'cool', 'smart', 'would_use')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (project_id, fingerprint)
);

create index if not exists community_project_reactions_count_index
on public.community_project_reactions(project_id, reaction);

alter table public.community_project_reactions enable row level security;

grant select, insert, update, delete
  on public.community_project_reactions
  to service_role;

create or replace view public.community_project_reaction_counts
with (security_invoker = true)
as
select
  project_id,
  count(*) filter (where reaction = 'love')::bigint as love_count,
  count(*) filter (where reaction = 'cool')::bigint as cool_count,
  count(*) filter (where reaction = 'smart')::bigint as smart_count,
  count(*) filter (where reaction = 'would_use')::bigint as would_use_count
from public.community_project_reactions
group by project_id;

grant select
  on public.community_project_reaction_counts
  to service_role;

create or replace function public.set_community_project_reaction(
  p_project_id uuid,
  p_fingerprint text,
  p_reaction text
)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  current_reaction text;
  selected_reaction text;
  reaction_counts jsonb;
begin
  if p_reaction not in ('love', 'cool', 'smart', 'would_use') then
    raise exception 'Invalid reaction.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.community_projects
    where id = p_project_id and moderation_status = 'approved'
  ) then
    raise exception 'Project is unavailable.' using errcode = 'P0002';
  end if;

  select reaction
  into current_reaction
  from public.community_project_reactions
  where project_id = p_project_id and fingerprint = p_fingerprint
  for update;

  if current_reaction = p_reaction then
    delete from public.community_project_reactions
    where project_id = p_project_id and fingerprint = p_fingerprint;
    selected_reaction := null;
  else
    insert into public.community_project_reactions(project_id, fingerprint, reaction)
    values (p_project_id, p_fingerprint, p_reaction)
    on conflict (project_id, fingerprint)
    do update set reaction = excluded.reaction, updated_at = now();
    selected_reaction := p_reaction;
  end if;

  select jsonb_build_object(
    'love', count(*) filter (where reaction = 'love'),
    'cool', count(*) filter (where reaction = 'cool'),
    'smart', count(*) filter (where reaction = 'smart'),
    'would_use', count(*) filter (where reaction = 'would_use')
  )
  into reaction_counts
  from public.community_project_reactions
  where project_id = p_project_id;

  return jsonb_build_object('counts', reaction_counts, 'selected', selected_reaction);
end;
$$;

revoke all on function public.set_community_project_reaction(uuid, text, text) from public;
grant execute on function public.set_community_project_reaction(uuid, text, text) to service_role;
