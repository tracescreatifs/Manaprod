# PROJECT_STATE.md : état du projet Mana Prod

Dernière mise à jour : 2026-11-16, fin du Prompt 00.

## 1. Où en est le projet

- **Dernier prompt terminé** : Prompt 00 (initialisation du dépôt et fichiers mémoire). En attente de validation par Claude et du Go de Ziza.
- **Prochaine étape** : Prompt 01 (socle Next.js), après le Go.
- **Branche de travail** : `main` (développement, avant mise en ligne).
- **Code applicatif** : aucun pour l'instant.

## 2. Feuille de route des prompts

Reprise de la section 13 du cahier des charges. Un prompt à la fois : le suivant n'est rédigé qu'après validation du rapport du précédent. Branche `main` jusqu'à la mise en ligne, puis `feat/...` ou `fix/...`.

| Prompt | Lot | Contenu | Prérequis côté Ziza | État |
|---|---|---|---|---|
| 00 | Initialisation | Organisation du dépôt, lecture du cahier et des prototypes, création de `CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`, `.gitignore`, `.env.example`. Aucun code applicatif | Dépôt GitHub créé avec le kit | Fait, en attente de validation |
| 01 | Socle | Projet Next.js (App Router, TypeScript strict, lint, Tailwind), tokens de la charte (section 4.2), Schibsted Grotesk via `next/font`, clients Supabase serveur et navigateur sans crash si variables absentes, favicon et icônes, photos de l'équipe copiées dans `public/team/`, page d'accueil minimale déployée. Aucune fonctionnalité métier | Projets Supabase et Vercel créés, Vercel relié au dépôt, 4 variables du Prompt 01 saisies | À faire |
| 02 | Fondations | Types `src/types/database.ts` écrits à la main d'après `0001_init.sql`, couche de lecture des données avec étiquettes de cache, utilitaires YouTube (section 10) avec tests, composants Logo et Symbole, en-tête, pied de page, boutons, composants de mouvement, transition entre pages, page 404 | `0001_init.sql` puis `seed/0001_seed.sql` exécutés et confirmés | À faire |
| 03 | Accueil | Page d'accueil complète (section 6.2) | | À faire |
| 04 | Réalisations | Liste avec filtres, grille, aperçu au survol ; fiche projet (vidéos, photos, visionneuse, livrables, projet suivant) | | À faire |
| 05 | Services et studio | Pages Services et Le studio (compteurs, équipe, équipement) | | À faire |
| 06 | Contact | Formulaire, validation serveur, pot de miel, limitation de fréquence, enregistrement en base, emails avec Resend (notification et accusé de réception) | Compte Resend, domaine vérifié, 3 variables du Prompt 06 | À faire |
| 07 | Audit 1 | Contrôle complet des prompts 01 à 06 : sécurité, mobile 360 px, accessibilité, cohérence avec les prototypes | | À faire |
| 08 | Authentification | Connexion, protection de `/admin`, coquille du dashboard, onglets Showreel et Réglages, revalidation du cache après chaque enregistrement | Compte administrateur créé dans Supabase Auth ; SQL de déclaration de l'administrateur fourni dans le rapport (il contient un identifiant de compte, il ne va pas dans le dépôt) | À faire |
| 09 | Admin projets | Onglet Projets complet : vidéos, téléversement des photos et de la miniature, livrables, ordre, publication | | À faire |
| 10 | Admin suite | Onglets Clients (avec logos), Équipe, Messages | | À faire |
| 11 | Audit 2 | Contrôle complet des prompts 08 à 10, en particulier RLS et stockage | | À faire |
| 12 | Qualité | SEO (métadonnées, sitemap, Open Graph, données structurées), accessibilité AA, performance (section 11), route `/api/keepalive` et cron Vercel tous les 6 jours | Variable `CRON_SECRET` | À faire |
| 13 | Mise en ligne | Vérifications de la section 12 de la méthode et de la section 12 du cahier, guide pas à pas pour pointer manaprod.com vers Vercel | Accès au DNS de manaprod.com | À faire |

### Ajustements proposés au Prompt 00 (non appliqués, en attente de décision)

Détail et raisons dans le rapport du Prompt 00. La feuille de route ci-dessus reste celle du cahier tant que Ziza n'a pas validé.

1. Avancer la route `/api/keepalive` et le cron (et donc `CRON_SECRET`) du Prompt 12 au Prompt 02 : la base peut être mise en pause pendant le développement, dès 7 jours sans activité.
2. Avancer l'accès au DNS de manaprod.com (ou au moins la possibilité d'y ajouter des enregistrements) avant le Prompt 06 : Resend exige des enregistrements DNS pour vérifier le domaine d'expédition, sans quoi l'accusé de réception aux visiteurs est impossible.
3. Ajouter au Prompt 06 une migration `0002_` pour la limitation de débit du formulaire (stockage des envois récents par IP hachée), car une limite en mémoire ne fonctionne pas de façon fiable sur Vercel.
4. Ajouter la page des mentions légales (avec une section confidentialité) à un prompt explicite (Prompt 05 ou 12) : elle est demandée (cahier 6.9, méthode section 12) mais absente de l'arborescence et de la feuille de route.

## 3. Fait

- Prompt 00 : archive extraite selon l'arborescence de la section 0 du cahier, archive supprimée, cahier déplacé dans `docs/`. Lecture complète de la méthode, du cahier, des deux prototypes, du dossier du logo, de la plaquette et des fichiers SQL. Création de `CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`, `.gitignore`, `.env.example`.

## 4. Reste à faire

- Prompts 01 à 13 (voir la feuille de route).
- Décisions à prendre par Ziza sur les ambiguïtés listées dans le rapport du Prompt 00 (section 5 ci-dessous pour les plus importantes).

## 5. Problèmes ouverts

| N° | Problème | Bloque | Recommandation |
|---|---|---|---|
| P1 | Vérification du domaine d'expédition dans Resend impossible sans accès au DNS de manaprod.com (actuellement chez WordPress.com) | Prompt 06 (accusé de réception) | Obtenir l'accès DNS avant le Prompt 06 |
| P2 | Limitation de débit par IP sans stockage partagé prévu dans `0001_init.sql` | Prompt 06 | Migration `0002_` au Prompt 06 |
| P3 | Cron anti-pause prévu seulement au Prompt 12 | Stabilité de la base pendant le développement | Avancer au Prompt 02 |
| P4 | Page mentions légales (et confidentialité) absente de l'arborescence | Mise en ligne | L'ajouter à un prompt explicite |
| P5 | Le cahier demande une case « Publié », un slug modifiable et le changement de mot de passe, absents du prototype du dashboard ; le prototype contient un onglet « Publication » (export, import, réinitialisation) sans objet en production | Prompts 08 et 09 | Suivre le cahier, ne pas reprendre l'onglet Publication |
| P6 | Chiffre « Délai de réponse » : 24h sur le site et dans la base, 48h « Réactivité » dans la plaquette | Prompt 05 | Garder 24h (cahier et prototype), à confirmer par le client |

## 6. Contenus à fournir par le client

Section 15 du cahier des charges.

| N° | Contenu | Utilisé à partir du | État |
|---|---|---|---|
| 1 | Validation du logo Éclipse par Amath (version empilée proposée comme principale) | Prompt 01 | En attente |
| 2 | Validation de la typographie Schibsted Grotesk | Prompt 01 | En attente |
| 3 | Lien YouTube du showreel de l'agence | Prompt 03 (saisi dans le dashboard après le Prompt 08) | En attente |
| 4 | Contenus des 8 projets : liens YouTube, miniatures, photos, descriptions et livrables (années à confirmer, 2026 par défaut dans la base) | Prompt 04 (saisis dans le dashboard après le Prompt 09) | En attente |
| 5 | Confirmation des chiffres clés : 20+ réalisations, 8+ clients majeurs (et 24h ou 48h) | Prompt 05 | En attente |
| 6 | Équipe : nom complet de Babou, présentations courtes éventuelles, autres membres | Prompt 05 | En attente |
| 7 | Confirmation de la liste d'équipement | Prompt 05 | En attente |
| 8 | Email : fournisseur d'envoi (Resend proposé), adresse d'expédition, adresse de réception des demandes | Prompt 06 | En attente |
| 9 | Accès au DNS de manaprod.com (WordPress.com) | Prompt 06 (Resend) et Prompt 13 (domaine) | En attente |
| 10 | Contenu des mentions légales | Prompt 12 ou 13 | En attente |
| 11 | Version anglaise souhaitée en V2 ? | Hors V1 | En attente |
| 12 | Adresse email de l'administrateur principal | Prompt 08 | En attente |
| 13 | Logos des 8 clients (PNG transparent recommandé, pas de SVG) | Prompt 10 (saisis dans le dashboard) | En attente |

## 7. Registre des migrations

Claude Code ne marque jamais une migration comme exécutée : seul Ziza le confirme. Ordre d'exécution : de haut en bas.

| N° | Fichier | Objet | Exécutée par Ziza |
|---|---|---|---|
| 0001 | `supabase/migrations/0001_init.sql` | Migration de structure : tables, fonctions `is_admin()` et `set_updated_at()`, index, RLS, bucket `media` et ses policies | Non |
| 0001 (seed) | `supabase/seed/0001_seed.sql` | Données de départ : réglages, 8 projets, 8 clients, 3 membres de l'équipe. À exécuter après la migration `0001_init.sql` | Non |

## 8. Variables d'environnement

Saisies par Ziza dans Vercel. Noms et commentaires dans `.env.example`.

| Variable | Usage | Côté | Nécessaire à partir du | Saisie par Ziza |
|---|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Public | Prompt 01 | Non |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (lecture soumise à la RLS) | Public | Prompt 01 | Non |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service, insertion des messages de contact | Serveur uniquement | Prompt 01 | Non |
| `NEXT_PUBLIC_SITE_URL` | URL du site (Vercel puis manaprod.com) | Public | Prompt 01 | Non |
| `RESEND_API_KEY` | Envoi des emails | Serveur uniquement | Prompt 06 | Non |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les demandes | Serveur uniquement | Prompt 06 | Non |
| `CONTACT_FROM_EMAIL` | Adresse d'expédition (domaine vérifié dans Resend) | Serveur uniquement | Prompt 06 | Non |
| `CRON_SECRET` | Protège `/api/keepalive` | Serveur uniquement | Prompt 12 | Non |
