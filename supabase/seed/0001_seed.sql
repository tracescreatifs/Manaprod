-- =====================================================================
-- MANA PROD : données de départ 0001_seed
-- Contenu : réglages du site, 8 projets, 8 clients, 3 membres de l'équipe
-- (issus de la plaquette et du prototype).
-- Prérequis : migration supabase/migrations/0001_init.sql exécutée.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotent : chaque bloc n'insère que si la table est encore vide.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Données de départ
-- Insérées seulement si elles n'existent pas encore.
-- ---------------------------------------------------------------------

insert into public.site_settings
  (id, hero_title, hero_sub, showreel_title, phone, email, city, reply_promise, stats)
values (
  1,
  'C’est toujours celui qui éclaire qui demeure dans l’obscurité.',
  'Mana Prod, production audiovisuelle à Dakar',
  'Showreel 2026',
  '+221 78 011 43 08',
  'amathndiaye@manaprod.com',
  'Dakar, Sénégal',
  'Réponse sous 24h',
  '[{"value":"20+","label":"Réalisations"},{"value":"8+","label":"Clients majeurs"},{"value":"4K","label":"Standard de production"},{"value":"24h","label":"Délai de réponse"}]'::jsonb
)
on conflict (id) do nothing;

insert into public.projects (slug, client, title, category, year, featured, position)
values
  ('unicef-staff-team-awards',                'UNICEF',        'Staff Team Awards',                          'Film institutionnel',  2026, true,  1),
  ('cbao-groupe-attijariwafa',                'CBAO',          'Groupe Attijariwafa',                        'Film corporate',       2026, true,  2),
  ('seneau-5e-anniversaire',                  'SEN''EAU',      '5e anniversaire',                            'Film institutionnel',  2026, true,  3),
  ('bis-banque-islamique',                    'BIS',           'Banque Islamique',                           'Spot publicitaire',    2026, true,  4),
  ('kayel-cafe-lancement-produit',            'Kayel Café',    'Lancement produit',                          'Film publicitaire',    2026, true,  5),
  ('forhope-inauguration-maison-des-parents', 'Forhope',       'Inauguration de « la maison des parents »',  'Couverture événement', 2026, true,  6),
  ('realites-sn-realites-senegal',            'Réalités SN',   'Réalités Sénégal',                           'Documentaire',         2026, false, 7),
  ('port-de-dakar-reportage-maritime',        'Port de Dakar', 'Reportage maritime',                         'Reportage industriel', 2026, false, 8)
on conflict (slug) do nothing;

insert into public.clients (name, position)
select v.name, v.position
from (values
  ('UNICEF', 1), ('CBAO', 2), ('SEN''EAU', 3), ('BIS', 4),
  ('Kayel Café', 5), ('Forhope', 6), ('Réalités SN', 7), ('Port de Dakar', 8)
) as v(name, position)
where not exists (select 1 from public.clients);

-- Les photos de l'équipe sont des fichiers statiques du site (dossier public/team).
-- Un chemin qui commence par « / » désigne un fichier statique, sinon un fichier du bucket « media ».
insert into public.team_members (name, role, photo_path, position)
select v.name, v.role, v.photo_path, v.position
from (values
  ('Amath NDIAYE', 'Vidéaste et monteur professionnel', '/team/amath-ndiaye.jpg', 1),
  ('Babou',        'Cadreur',                           '/team/babou.jpg',        2),
  ('Sidy SARR',    'Motion designer',                   '/team/sidy-sarr.jpg',    3)
) as v(name, role, photo_path, position)
where not exists (select 1 from public.team_members);

-- ---------------------------------------------------------------------
-- 2. Vérification rapide (le résultat doit afficher 1, 8, 8, 3)
-- ---------------------------------------------------------------------
select
  (select count(*) from public.site_settings) as reglages,
  (select count(*) from public.projects)      as projets,
  (select count(*) from public.clients)       as clients,
  (select count(*) from public.team_members)  as equipe;
