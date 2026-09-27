create extension if not exists pgcrypto;

create table if not exists public.cf_profiles(
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.cf_contacts(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 first_name text not null,
 last_name text not null,
 email text not null,
 company text not null,
 title text not null,
 notes text not null default '',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.cf_deals(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 contact_id uuid not null references public.cf_contacts(id) on delete cascade,
 title text not null,
 value numeric(14,2) not null default 0 check(value>=0),
 stage text not null check(stage in('new','contacted','qualified','won','lost')),
 health_score integer not null default 50 check(health_score between 0 and 100),
 expected_close_date date,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.cf_activities(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 contact_id uuid not null references public.cf_contacts(id) on delete cascade,
 deal_id uuid references public.cf_deals(id) on delete set null,
 type text not null check(type in('note','email','call','meeting','status_change','ai_generation')),
 title text not null,
 description text not null default '',
 occurred_at timestamptz not null default now()
);

create table if not exists public.cf_ai_generations(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 contact_id uuid references public.cf_contacts(id) on delete set null,
 deal_id uuid references public.cf_deals(id) on delete set null,
 generation_type text not null,
 input_context jsonb not null default '{}'::jsonb,
 output_text text not null,
 model text,
 created_at timestamptz not null default now()
);

alter table public.cf_profiles enable row level security;
alter table public.cf_contacts enable row level security;
alter table public.cf_deals enable row level security;
alter table public.cf_activities enable row level security;
alter table public.cf_ai_generations enable row level security;

create policy "cf_profiles_select_own" on public.cf_profiles for select to authenticated using((select auth.uid())=id);
create policy "cf_profiles_insert_own" on public.cf_profiles for insert to authenticated with check((select auth.uid())=id);
create policy "cf_profiles_update_own" on public.cf_profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy "cf_contacts_own" on public.cf_contacts for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy "cf_deals_own" on public.cf_deals for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy "cf_activities_own" on public.cf_activities for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);
create policy "cf_ai_generations_own" on public.cf_ai_generations for all to authenticated using((select auth.uid())=owner_id) with check((select auth.uid())=owner_id);

create index if not exists cf_contacts_owner_idx on public.cf_contacts(owner_id);
create index if not exists cf_contacts_email_idx on public.cf_contacts(owner_id,lower(email));
create index if not exists cf_deals_owner_idx on public.cf_deals(owner_id);
create index if not exists cf_deals_stage_idx on public.cf_deals(owner_id,stage);
create index if not exists cf_activities_contact_idx on public.cf_activities(owner_id,contact_id,occurred_at desc);
create index if not exists cf_ai_generations_contact_idx on public.cf_ai_generations(owner_id,contact_id,created_at desc);
