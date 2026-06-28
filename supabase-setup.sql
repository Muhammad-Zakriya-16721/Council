-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  is_judge boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Allow public read access on profiles" on public.profiles
  for select using (true);

create policy "Allow users to update their own profiles" on public.profiles
  for update using (auth.uid() = id);

-- Create trigger to automatically insert profile on auth.users create
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, is_judge)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Guest'),
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger (drop if exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create personas table
create table if not exists public.personas (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  role text not null,
  avatar_style text not null,
  personality_traits text[] not null,
  system_prompt text not null,
  primary_bias text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on personas
alter table public.personas enable row level security;

-- Personas Policies
create policy "Allow users to read their own personas" on public.personas
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own personas" on public.personas
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own personas" on public.personas
  for update using (auth.uid() = user_id);

create policy "Allow users to delete their own personas" on public.personas
  for delete using (auth.uid() = user_id);

-- Create transcripts table
create table if not exists public.transcripts (
  id uuid not null primary key default gen_random_uuid(),
  session_id uuid not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  debate_text text not null,
  roadmap text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on transcripts
alter table public.transcripts enable row level security;

-- Transcripts Policies
create policy "Allow users to read their own transcripts" on public.transcripts
  for select using (auth.uid() = user_id);

create policy "Allow users to insert their own transcripts" on public.transcripts
  for insert with check (auth.uid() = user_id);

create policy "Allow users to update their own transcripts" on public.transcripts
  for update using (auth.uid() = user_id);
