-- =====================================================================
-- MANA PROD : migration 0002_contact_rate_limit
-- Contenu : table des envois récents du formulaire de contact, pour
-- limiter le nombre d'envois par visiteur (décisions D10 et D62).
-- Seule une empreinte (HMAC-SHA256) de l'adresse IP est stockée, jamais
-- l'adresse IP en clair. Les lignes de plus de 24 heures sont purgées par
-- l'application à chaque envoi accepté.
-- Prérequis : migration 0001_init.sql exécutée.
-- Où l'exécuter : Supabase > SQL Editor > New query > coller tout le fichier > Run.
-- Idempotente : peut être exécutée plusieurs fois sans erreur.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------

create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

-- Recherche des envois récents d'une même empreinte.
create index if not exists idx_contact_submissions_ip_created
  on public.contact_submissions (ip_hash, created_at);

-- ---------------------------------------------------------------------
-- 2. Droits d'accès : clé service uniquement
-- Les droits par défaut éventuels du projet sont retirés aux rôles
-- publics ; seul service_role (côté serveur) accède à la table.
-- ---------------------------------------------------------------------

revoke all on public.contact_submissions from public, anon, authenticated;
grant select, insert, delete on public.contact_submissions to service_role;

-- ---------------------------------------------------------------------
-- 3. Sécurité : RLS activée, aucune policy
-- Sans policy, aucune ligne n'est accessible aux rôles anon et
-- authenticated ; service_role contourne la RLS.
-- ---------------------------------------------------------------------

alter table public.contact_submissions enable row level security;
