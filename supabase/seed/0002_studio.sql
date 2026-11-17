-- =====================================================================
-- MANA PROD : données de départ 0002_studio
-- Contenu : photo d'ouverture de la page Le studio, la photo d'Amath
-- NDIAYE du dossier public (/team/amath-ndiaye.jpg), seulement si aucune
-- photo n'est encore choisie.
-- Prérequis : migration 0004_studio.sql exécutée.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotente : peut être exécutée plusieurs fois, sans jamais remplacer
-- une photo choisie dans le dashboard.
-- =====================================================================

update public.site_settings
set studio_hero_path = '/team/amath-ndiaye.jpg'
where id = 1
  and (studio_hero_path is null or btrim(studio_hero_path) = '');

-- Contrôle : une ligne, avec le chemin de la photo d'ouverture.
select id, studio_hero_path from public.site_settings where id = 1;
