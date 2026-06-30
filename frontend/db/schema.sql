-- ResumeRoute schema — run in Supabase SQL editor
create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  skills text[] default '{}',
  resume_url text,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select to authenticated using (auth.uid() = id);
drop policy if exists "profiles self insert" on public.profiles;
create policy "profiles self insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table if not exists public.job_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null,
  company text not null,
  location text,
  salary text,
  match_score int not null default 0,
  job_url text not null,
  alerted boolean not null default false,
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.job_matches to authenticated;
grant all on public.job_matches to service_role;
alter table public.job_matches enable row level security;
drop policy if exists "job_matches self read" on public.job_matches;
create policy "job_matches self read" on public.job_matches for select to authenticated using (auth.uid() = user_id);
drop policy if exists "job_matches self insert" on public.job_matches;
create policy "job_matches self insert" on public.job_matches for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "job_matches self update" on public.job_matches;
create policy "job_matches self update" on public.job_matches for update to authenticated using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('resumes', 'resumes', true)
on conflict (id) do update set public = true;
drop policy if exists "resumes self upload" on storage.objects;
create policy "resumes self upload" on storage.objects for insert to authenticated
with check (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "resumes self update" on storage.objects;
create policy "resumes self update" on storage.objects for update to authenticated
using (bucket_id = 'resumes' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "resumes public read" on storage.objects;
create policy "resumes public read" on storage.objects for select to public using (bucket_id = 'resumes');
