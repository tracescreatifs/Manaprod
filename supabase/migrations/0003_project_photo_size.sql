-- =====================================================================
-- MANA PROD : migration 0003_project_photo_size
-- Contenu : largeur et hauteur (en pixels) des photos de projet, connues
-- au téléversement depuis le dashboard. Le site les utilise pour réserver
-- la place de chaque photo avant son chargement (aucun saut de mise en
-- page). Les photos existantes gardent des dimensions vides : le site
-- applique alors le comportement de la décision D57.
-- Prérequis : migrations 0001_init.sql et 0002_contact_rate_limit.sql exécutées.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotente : peut être exécutée plusieurs fois sans erreur.
-- Droits et RLS : inchangés (les policies de project_photos portent sur
-- les lignes entières, les nouvelles colonnes en héritent).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Colonnes (nullables : dimensions inconnues pour les photos existantes)
-- ---------------------------------------------------------------------

alter table public.project_photos add column if not exists width int;
alter table public.project_photos add column if not exists height int;

comment on column public.project_photos.width is
  'Largeur de l''image en pixels, enregistrée au téléversement (null si inconnue).';
comment on column public.project_photos.height is
  'Hauteur de l''image en pixels, enregistrée au téléversement (null si inconnue).';

-- ---------------------------------------------------------------------
-- 2. Contraintes : strictement positives si renseignées
-- ---------------------------------------------------------------------

alter table public.project_photos drop constraint if exists project_photos_width_check;
alter table public.project_photos
  add constraint project_photos_width_check check (width is null or width > 0);

alter table public.project_photos drop constraint if exists project_photos_height_check;
alter table public.project_photos
  add constraint project_photos_height_check check (height is null or height > 0);
