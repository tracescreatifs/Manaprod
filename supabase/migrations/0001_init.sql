-- =====================================================================
-- MANA PROD : migration 0001_init
-- Contenu : tables, fonctions, index, sécurité (RLS), stockage des images.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotente : peut être exécutée plusieurs fois sans casser les données.
-- Les données de départ sont dans supabase/seed/0001_seed.sql (à exécuter après).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Tables
-- ---------------------------------------------------------------------

-- Réglages du site (une seule ligne, id = 1)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  hero_title text not null,
  hero_sub text,
  showreel_url text,
  showreel_youtube_id text,
  showreel_title text not null default 'Showreel',
  phone text,
  email text,
  city text,
  reply_promise text not null default 'Réponse sous 24h',
  stats jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- Projets (réalisations)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  client text not null,
  title text not null,
  category text not null,
  year int,
  description text,
  deliverables text[] not null default '{}',
  thumbnail_path text,
  featured boolean not null default false,
  published boolean not null default true,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_category_check check (category in (
    'Film institutionnel','Film corporate','Spot publicitaire','Film publicitaire',
    'Documentaire','Reportage industriel','Couverture événement','Motion design',
    'Photographie','Campagne multi-supports'
  ))
);

-- Vidéos YouTube d'un projet
create table if not exists public.project_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  youtube_url text not null,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  title text,
  position int not null default 0
);

-- Photos d'un projet
create table if not exists public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0
);

-- Clients (bandeau « Ils nous font confiance »)
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text,
  logo_white boolean not null default false,
  position int not null default 0
);

-- Équipe
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  photo_path text,
  position int not null default 0
);

-- Messages du formulaire de contact
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  project_type text,
  desired_date text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- Administrateurs (comptes Supabase Auth autorisés à modifier le site)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2. Fonctions et déclencheurs
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3. Index
-- ---------------------------------------------------------------------

create index if not exists idx_projects_position on public.projects (position);
create index if not exists idx_project_videos_project on public.project_videos (project_id, position);
create index if not exists idx_project_photos_project on public.project_photos (project_id, position);
create index if not exists idx_clients_position on public.clients (position);
create index if not exists idx_team_members_position on public.team_members (position);
create index if not exists idx_contact_messages_created on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------
-- 4. Sécurité : Row Level Security
-- Lecture publique du contenu, écriture réservée aux administrateurs.
-- Les messages de contact sont insérés côté serveur avec la clé service.
-- ---------------------------------------------------------------------

alter table public.site_settings    enable row level security;
alter table public.projects         enable row level security;
alter table public.project_videos   enable row level security;
alter table public.project_photos   enable row level security;
alter table public.clients          enable row level security;
alter table public.team_members     enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_users      enable row level security;

-- site_settings
drop policy if exists "site_settings_lecture" on public.site_settings;
create policy "site_settings_lecture" on public.site_settings
  for select using (true);
drop policy if exists "site_settings_admin" on public.site_settings;
create policy "site_settings_admin" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- projects
drop policy if exists "projects_lecture" on public.projects;
create policy "projects_lecture" on public.projects
  for select using (published or public.is_admin());
drop policy if exists "projects_admin" on public.projects;
create policy "projects_admin" on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- project_videos
drop policy if exists "project_videos_lecture" on public.project_videos;
create policy "project_videos_lecture" on public.project_videos
  for select using (
    exists (select 1 from public.projects p
            where p.id = project_id and (p.published or public.is_admin()))
  );
drop policy if exists "project_videos_admin" on public.project_videos;
create policy "project_videos_admin" on public.project_videos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- project_photos
drop policy if exists "project_photos_lecture" on public.project_photos;
create policy "project_photos_lecture" on public.project_photos
  for select using (
    exists (select 1 from public.projects p
            where p.id = project_id and (p.published or public.is_admin()))
  );
drop policy if exists "project_photos_admin" on public.project_photos;
create policy "project_photos_admin" on public.project_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- clients
drop policy if exists "clients_lecture" on public.clients;
create policy "clients_lecture" on public.clients
  for select using (true);
drop policy if exists "clients_admin" on public.clients;
create policy "clients_admin" on public.clients
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- team_members
drop policy if exists "team_members_lecture" on public.team_members;
create policy "team_members_lecture" on public.team_members
  for select using (true);
drop policy if exists "team_members_admin" on public.team_members;
create policy "team_members_admin" on public.team_members
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- contact_messages : aucune politique publique (ni lecture ni écriture)
drop policy if exists "contact_messages_admin" on public.contact_messages;
create policy "contact_messages_admin" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- admin_users : chacun peut seulement vérifier sa propre ligne
drop policy if exists "admin_users_soi" on public.admin_users;
create policy "admin_users_soi" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- 5. Stockage des images : bucket public « media »
-- Lecture publique, écriture réservée aux administrateurs.
-- SVG volontairement exclu (sécurité).
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760,
        array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "mana_media_lecture" on storage.objects;
create policy "mana_media_lecture" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "mana_media_ajout" on storage.objects;
create policy "mana_media_ajout" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "mana_media_modif" on storage.objects;
create policy "mana_media_modif" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "mana_media_suppr" on storage.objects;
create policy "mana_media_suppr" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

