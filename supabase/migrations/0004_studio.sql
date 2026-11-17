-- =====================================================================
-- MANA PROD : migration 0004_studio
-- Contenu : page Le studio immersive (Prompt 14).
--   1. site_settings.studio_hero_path : photo d'ouverture de la page Le
--      studio (chemin dans le bucket media, ou chemin du dossier public
--      commençant par « / »). Vide : le site affiche la photo de départ.
--   2. Table backstage_photos : photos « Dans les coulisses », gérées
--      depuis l'onglet Coulisses du dashboard.
-- Stockage : aucun changement. Les policies du bucket media (0001)
-- couvrent tous les dossiers, dont studio/ et backstage/ (lecture par
-- l'API, ajout, remplacement et suppression réservés à is_admin()).
-- Prérequis : migrations 0001 à 0003 exécutées.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotente : peut être exécutée plusieurs fois sans erreur.
-- Données de départ : supabase/seed/0002_studio.sql (à exécuter après).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Photo d'ouverture de la page Le studio
-- ---------------------------------------------------------------------

alter table public.site_settings add column if not exists studio_hero_path text;

comment on column public.site_settings.studio_hero_path is
  'Photo d''ouverture de la page Le studio : chemin dans le bucket media, ou chemin du dossier public commençant par « / ».';

-- ---------------------------------------------------------------------
-- 2. Photos des coulisses
-- ---------------------------------------------------------------------

create table if not exists public.backstage_photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  alt text,
  width int,
  height int,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.backstage_photos drop constraint if exists backstage_photos_width_check;
alter table public.backstage_photos
  add constraint backstage_photos_width_check check (width is null or width > 0);

alter table public.backstage_photos drop constraint if exists backstage_photos_height_check;
alter table public.backstage_photos
  add constraint backstage_photos_height_check check (height is null or height > 0);

create index if not exists idx_backstage_photos_position on public.backstage_photos (position);

-- ---------------------------------------------------------------------
-- 3. Droits d'accès (même modèle que 0001) : la RLS reste la règle métier
-- ---------------------------------------------------------------------

grant select on public.backstage_photos to anon;
grant select, insert, update, delete on public.backstage_photos to authenticated;
grant all on public.backstage_photos to service_role;

-- ---------------------------------------------------------------------
-- 4. Sécurité : lecture publique, écriture réservée aux administrateurs
-- ---------------------------------------------------------------------

alter table public.backstage_photos enable row level security;

drop policy if exists "backstage_photos_lecture" on public.backstage_photos;
create policy "backstage_photos_lecture" on public.backstage_photos
  for select using (true);

drop policy if exists "backstage_photos_admin" on public.backstage_photos;
create policy "backstage_photos_admin" on public.backstage_photos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
