# PROJECT_STATE.md : état du projet Mana Prod

Dernière mise à jour : 2026-11-17, fin du Prompt 07.

## 1. Où en est le projet

- **Dernier prompt terminé** : Prompt 07 (page Contact, anti-spam et emails). En attente de validation et du Go de Ziza, après exécution de `0002_contact_rate_limit.sql`.
- **Prochaine étape** : Prompt 08 (audit 1), après le Go.
- **Branche de travail** : `main` (développement, avant mise en ligne).
- **Code applicatif** : socle Next.js 16.4.6, en-tête, menu mobile, pied de page, bouton-lien, composants de mouvement, transition entre pages, page 404, utilitaires YouTube testés, types de la base, lectures mises en cache (réglages, projets, clients), accueil complet (hero, studio, sélection, clients, appel final), page Réalisations avec filtres, fiches projet, pages Services, Le studio, Mentions légales et Contact (formulaire, limitation des envois, emails Resend), route `/api/keepalive` et cron, intégration continue, site entier en `noindex`.

## 2. Feuille de route des prompts

Reprise de la section 13 du cahier des charges (version 1.5). Renumérotée au Prompt 02 (décision D36, table de correspondance dans `decisions.md`). Un prompt à la fois : le suivant n'est rédigé qu'après validation du rapport du précédent. Branche `main` jusqu'à la mise en ligne, puis `feat/...` ou `fix/...`.

| Prompt | Lot | Contenu | Prérequis côté Ziza | État |
|---|---|---|---|---|
| 00 | Initialisation | Organisation du dépôt, lecture du cahier et des prototypes, création de `CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`, `.gitignore`, `.env.example`. Aucun code applicatif | Dépôt GitHub créé avec le kit | Fait, validé |
| 01 | Socle | Arbitrages du Prompt 00, correction de `0001_init.sql` avant exécution (GRANT, lecture du bucket), projet Next.js (App Router, TypeScript strict, lint, Tailwind), tokens de la charte, Schibsted Grotesk via `next/font`, clients Supabase serveur et navigateur sans crash si variables absentes, favicon et icônes, photos de l'équipe dans `public/team/`, site en `noindex`, page d'accueil minimale | Projet Vercel créé et relié au dépôt, `NEXT_PUBLIC_SITE_URL` saisie | Fait, validé |
| 02 | Interface | Logo et LogoEmpile, en-tête et menu mobile, pied de page, bouton-lien, apparition au défilement, révélation mot par mot, transition entre pages, page 404, utilitaires YouTube avec tests. Sans base de données | | Fait, validé |
| 03 | Données | Types `src/types/database.ts` écrits à la main d'après `0001_init.sql`, couche de lecture des données avec étiquettes de cache, route `/api/keepalive` et cron Vercel tous les 6 jours, région des fonctions Vercel à Paris (`cdg1`) dans `vercel.json` | Projet Supabase créé en région Paris (`eu-west-3`), inscriptions publiques désactivées, `0001_init.sql` puis `seed/0001_seed.sql` exécutés et confirmés, variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `CRON_SECRET` saisies | Fait, validé |
| 04 | Accueil | Page d'accueil complète (section 6.2) : hero rendu côté serveur, iframe chargée ensuite, filigrane à 6 % (composant Symbole), sélection avec repli sur les 6 premiers projets publiés | | Fait, validé |
| 05 | Réalisations et fiche projet | Liste avec filtres, grille, aperçu au survol ; fiche projet (vidéos, photos, visionneuse, livrables, projet suivant) | | Fait, validé |
| 06 | Services, Le studio et mentions légales | Pages Services et Le studio (compteurs, équipe, équipement), page `/mentions-legales` avec section confidentialité (blocs NINEA, RCCM, siège masqués tant qu'ils manquent) | | Fait, validé |
| 07 | Contact | Formulaire, validation serveur, pot de miel, migration `0002_` de limitation des envois (IP hachée, purge), enregistrement en base, client Supabase service, emails avec Resend (notification et accusé de réception sans le message du visiteur) | Accès au DNS de manaprod.com (vérification du domaine dans Resend, MX intouchés), compte Resend, domaine vérifié, variables `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Fait, en attente de validation |
| 08 | Audit 1 | Contrôle complet des prompts 01 à 07 : sécurité, mobile 360 px, accessibilité, cohérence avec les prototypes | | À faire |
| 09 | Authentification | Connexion, mot de passe oublié (`/admin/mot-de-passe-oublie`, `/admin/nouveau-mot-de-passe`), protection de `/admin`, coquille du dashboard (adresse de l'admin connecté, déconnexion), onglets Showreel et Réglages, revalidation du cache après chaque enregistrement | Compte administrateur créé dans Supabase Auth ; SMTP de Resend configuré dans Supabase Auth ; URL de redirection de l'authentification réglées ; SQL de déclaration de l'administrateur fourni dans le rapport (jamais commité) | À faire |
| 10 | Admin projets | Onglet Projets complet : vidéos, téléversement des photos et de la miniature, livrables, ordre, publication, client et titre obligatoires, « Voir la page » désactivé si non publié | | À faire |
| 11 | Admin clients, équipe et messages | Onglets Clients (avec logos), Équipe, Messages | | À faire |
| 12 | Audit 2 | Contrôle complet des prompts 09 à 11, en particulier RLS et stockage | | À faire |
| 13 | Qualité | SEO (métadonnées, sitemap, Open Graph, données structurées), accessibilité AA, performance (section 11) | | À faire |
| 14 | Mise en ligne | Vérifications de la section 12 de la méthode et de la section 12 du cahier, retrait du `noindex` global, guide pas à pas pour pointer manaprod.com vers Vercel sans modifier les MX | Accès au DNS de manaprod.com | À faire |

### Ajustements validés (arbitrage du rapport du Prompt 00)

Détail dans `decisions.md` (D08 à D31, D36 et D37) et dans le cahier v1.5. Numéros de prompt ci-dessous selon la numérotation actuelle.

1. Keepalive et cron Vercel au Prompt 03 (au lieu de l'ancien Prompt 12), `CRON_SECRET` nécessaire au Prompt 03 (D08, D36).
2. Accès au DNS de manaprod.com requis avant le Prompt 07 ; les MX existants ne sont jamais modifiés (D09).
3. Migration `0002_` au Prompt 07 pour la limitation des envois du formulaire, IP hachée et purge (D10).
4. Page `/mentions-legales` avec section confidentialité au Prompt 06 (D11).
5. `SUPABASE_SERVICE_ROLE_KEY` et client service seulement au Prompt 07 (D13).
6. Mot de passe oublié au Prompt 09, avec SMTP de Resend dans Supabase Auth (D25).
7. Site entier en `noindex` jusqu'au Prompt 14 (D31).
8. Ancien Prompt 02 scindé en Prompt 02 « Interface » et Prompt 03 « Données », prompts suivants décalés d'un numéro (D36).
9. Supabase en région Paris (`eu-west-3`), fonctions Vercel en région Paris (`cdg1`) (D37).

## 3. Fait

- **Prompt 00** : archive extraite et supprimée, cahier déplacé dans `docs/`, lecture complète de la documentation, création de `CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`, `.gitignore`, `.env.example`.
- **Prompt 01** :
  - Arbitrages inscrits dans `decisions.md` (D08 à D31), plus D32 à D35 (versions, configuration par défaut, `server-only`, noms des routes de réinitialisation).
  - Cahier des charges passé en version 1.4.
  - `0001_init.sql` corrigé avant exécution : GRANT explicites, lecture du bucket `media` réservée aux administrateurs. Validé par pglast et par une exécution réelle (deux passes) dans Postgres 16 avec schémas `auth` et `storage` simulés, plus tests des droits par rôle.
  - Socle Next.js 16.4.6 : TypeScript strict, `src/`, alias `@/`, ESLint, Tailwind 4 avec tokens de la charte, Schibsted Grotesk via `next/font`, métadonnées de base, `noindex` global, icônes, clients Supabase serveur et navigateur (non appelés), photos de l'équipe dans `public/team/`, logo empilé dans `public/brand/` (retiré au Prompt 02), page d'accueil minimale.
- **Prompt 02** :
  - Feuille de route renumérotée (00 à 14) dans ce fichier et dans le cahier v1.5 ; décisions D36 à D40.
  - Dépendances : `motion`, `lucide-react`, `vitest` ; script `npm run test`.
  - `src/lib/youtube.ts` (extraction de l'identifiant, URL du lecteur nocookie et du hero, miniatures) et 43 tests Vitest.
  - Composants `Logo` et `LogoEmpile` (SVG officiels en ligne, PROD en `#8FA3A8`), `SiteHeader` (transparent puis opaque sur l'accueil, menu mobile plein écran accessible), `SiteFooter` (année en cache d'un jour), `ButtonLink`, `Reveal`, `WordReveal`, transition entre pages (`src/app/template.tsx`), page 404 (`src/app/not-found.tsx`).
  - Page d'accueil minimale : `LogoEmpile`, signature révélée mot par mot, coordonnées en fondu ; `public/brand/` supprimé.
- **Prompt 03** :
  - Registre : `0001_init.sql` et `seed/0001_seed.sql` exécutés par Ziza (confirmé le 2026-11-17) ; variables Supabase et `CRON_SECRET` saisies.
  - `src/types/database.ts` : 8 tables (Row, Insert, Update, Relationships), `is_admin`, `SiteStat`, `PROJECT_CATEGORIES` ; contrôle automatique contre le SQL (59 colonnes).
  - `src/lib/supabase/public.ts` (client sans session), `src/lib/data/tags.ts`, `src/lib/data/settings.ts` (`getSiteSettings()` en cache, `siteContact()`), `src/lib/phone.ts` et ses tests.
  - Accueil minimal et pied de page alimentés par `site_settings` ; plus aucune coordonnée en dur.
  - `/api/keepalive`, `vercel.json` (cron `0 6 */6 * *`, région `cdg1`), `.github/workflows/ci.yml`.
  - Décisions D41 à D46.
- **Prompt 04** :
  - Correction de D43 : build Vercel sans variables Supabase en échec (D47), logique centralisée dans `src/lib/data/source.ts`.
  - `getHomeProjects()` (une requête, première vidéo par projet) et `getClients()`, étiquettes `projects` et `clients`.
  - Images distantes limitées à `i.ytimg.com/vi/**` et `*.supabase.co/storage/v1/object/public/media/**` ; `mediaUrl()` (D06) et ses tests ; option `autoplay` de `youTubeEmbedUrl()` et ses tests (55 tests au total).
  - Accueil complet : hero (titre et ligne en CSS, repli lumière et symbole à 6 %, vidéo de fond sur écran large seulement, fenêtre modale du showreel), Le studio, Sélection (`ProjectCard` avec miniature téléversée, YouTube ou carte typographique, aperçu au survol), bandeau des clients en CSS, appel final, apparition au défilement.
  - Composants `Symbole`, `YouTubeThumbnail`, `ProjectCard`, `Hero`, `HeroBackground`, `ShowreelPlayer`, `ClientMarquee` ; `WordReveal` et `LogoEmpile` supprimés (plus utilisés).
  - Lighthouse mobile de l'accueil (sans showreel, données simulées) : performance 97 à 99, accessibilité 100, bonnes pratiques 100, SEO 60 (seul échec : `noindex` voulu), LCP 0,8 s sur le titre, CLS 0.
  - Décisions D47 à D52.
- **Prompt 05** :
  - Miniatures YouTube servies sans l'optimisation de Vercel (D53).
  - `getProjects()` (une requête : première vidéo, nombre de vidéos et de photos), `getProject(slug)`, `getNextProject(slug)` ; étiquettes `projects` et `project:<slug>` (`projectTag()`).
  - Page `/realisations` : compteur, filtres des catégories utilisées reflétés dans l'URL (D54), grille éditoriale 7/5 puis 5/7, `ProjectCard` étendue (nombre de vidéos et de photos, niveau de titre).
  - Fiche `/realisations/[slug]` : retour, titre, méta, vidéo principale en façade, description, livrables, autres vidéos, photos en maçonnerie avec visionneuse, projet suivant, message si aucun contenu ; pages prérendues (D55) ; métadonnées et image de partage par projet.
  - Appel final partagé (`ContactCta`) entre l'accueil et Réalisations ; piégeage du focus des fenêtres modales (D56).
  - Utilitaires `plural`, `truncate`, `paragraphs`, `categorySlug` et leurs tests (66 tests au total) ; `vitest.config.ts` pour l'alias `@/`.
  - Lighthouse mobile (données simulées) : accueil, Réalisations et fiche à 99 ou 100 en performance, 100 en accessibilité, LCP 0,8 s, CLS 0.
  - Décisions D53 à D57.
- **Prompt 06** :
  - Page `/services` : introduction, 6 services (titre turquoise au survol), « Comment nous travaillons », « Pourquoi Mana Prod », appel final.
  - Page `/studio` : présentation, chiffres clés de `site_settings.stats` avec compteurs animés (D60), « Français et wolof », équipe (`getTeam()`, étiquette `team`, portraits 4:5, initiales sans photo), équipement, appel final.
  - Page `/mentions-legales` : éditeur, hébergement, données et stockage, confidentialité, cookies, propriété intellectuelle, date de mise à jour ; blocs NINEA, RCCM et siège masqués tant qu'ils sont vides.
  - Contenus fixes dans `src/content/` (D58) ; composant `SectionRow` (première rangée sans animation, D59) ; utilitaires `parseStatValue`, `initials`, `formatDateFr` et leurs tests (72 tests au total).
  - Lighthouse mobile (données simulées) : Services, Le studio, Mentions légales et accueil à 100 en performance, accessibilité et bonnes pratiques, LCP 0,8 s, CLS 0.
  - Décisions D58 à D61.
- **Prompt 07** :
  - Migration `supabase/migrations/0002_contact_rate_limit.sql` (table `contact_submissions`, RLS sans policy, droits à la seule clé service) ; types mis à jour.
  - `src/lib/supabase/service.ts` (seul fichier qui lit la clé service), `src/lib/email.ts` (Resend), `src/lib/contact/` (validation zod, empreinte de l'IP, échappement, contenu des deux emails) et leurs tests (86 tests au total).
  - Route `POST /api/contact` : validation, champ piège, limitation à 3 envois par heure (D62), enregistrement, notification à Mana Prod, accusé de réception sans le message ; JSON ou redirection 303 sans JavaScript (D63).
  - Page `/contact` : téléphone et WhatsApp, email avec bouton Copier, ville, « Et ensuite », formulaire accessible avec erreurs par champ et résumé, confirmation dans la page.
  - Mentions légales : adresse de Vercel (D64) ; `zod` et `resend` (D65).
  - Lighthouse mobile (données simulées) : Contact à 100 en performance, accessibilité et bonnes pratiques.
  - Décisions D62 à D65.

## 4. Reste à faire

- Prompts 08 à 14 (voir la feuille de route).
- Actions Ziza du Prompt 07 : migration 0002, Resend, 4 variables, redéploiement, tests (rapport du Prompt 07).

## 5. Problèmes ouverts

| N° | Problème | Bloque | État |
|---|---|---|---|
| P1 | Vérification du domaine d'expédition dans Resend impossible sans accès au DNS de manaprod.com (WordPress.com) | Prompt 07 | Arbitré (D09) : accès DNS demandé dès maintenant, à obtenir avant le Prompt 07 |
| P2 | Limitation de débit par IP sans stockage partagé dans `0001_init.sql` | Prompt 07 | Résolu au Prompt 07 : migration `0002_contact_rate_limit.sql` (D62), à exécuter par Ziza |
| P3 | Cron anti-pause prévu trop tard | Stabilité de la base | Résolu au Prompt 03 : route `/api/keepalive` et cron Vercel (production uniquement) |
| P4 | Page mentions légales absente de l'arborescence | Mise en ligne | Résolu dans le cahier v1.4 (D11) : Prompt 06 ; identifiants légaux à fournir |
| P5 | Écarts entre le cahier et le prototype du dashboard | Prompts 09 et 10 | Arbitré (D21, D22, D25, D27) : le cahier prime |
| P6 | Délai de réponse : 24h (site, base) ou 48h (plaquette) | Prompt 06 | Arbitré (D16) : 24h par défaut, à confirmer par le client |
| P7 | `npm audit` signale une vulnérabilité modérée (minimatch, dépendance de développement d'ESLint via `eslint-config-next` 16.4.6) ; le correctif proposé rétrograde `eslint-config-next` en 15.x | Aucun (outil de développement, absent du site déployé) | À revoir lors d'une mise à jour de `eslint-config-next` |
| P8 | Liens vers des pages pas encore créées (404 et erreurs de préchargement dans la console) | Aucun | Fermé au Prompt 07 : toutes les pages publiques existent |
| P9 | Fenêtre modale du showreel : quand le focus est dans le lecteur YouTube (après un clic dans la vidéo), Échap est reçue par la page de YouTube et ne ferme pas la fenêtre | Aucun (bouton de fermeture et clic sur le fond disponibles) | Limite connue des iframes d'un autre domaine (D51), acceptée sauf avis contraire |
| P10 | Première visite d'une adresse de fiche inexistante (`/realisations/nimporte-quoi`) : la page 404 s'affiche mais la réponse HTTP vaut 200, puis 404 aux visites suivantes (rendu en flux de Cache Components). La page porte `noindex` | Aucun pour le visiteur ; léger pour le référencement après la mise en ligne | À revoir au Prompt 13 (qualité, SEO) |

## 6. Contenus à fournir par le client

Section 15 du cahier des charges (version 1.5).

| N° | Contenu | Utilisé à partir du | État |
|---|---|---|---|
| 1 | Validation du logo Éclipse par Amath (version empilée proposée comme principale) | Prompt 01 | En attente |
| 2 | Validation de la typographie Schibsted Grotesk | Prompt 01 | En attente |
| 3 | Lien YouTube du showreel de l'agence | Prompt 04 (saisi dans le dashboard après le Prompt 09) | En attente |
| 4 | Contenus des 8 projets : liens YouTube, miniatures, photos, descriptions et livrables | Prompt 05 (saisis dans le dashboard après le Prompt 10) | En attente |
| 5 | Années des 8 projets (2026 enregistré par défaut) | Prompt 05 | En attente |
| 6 | Confirmation des chiffres clés : 20+ réalisations, 8+ clients majeurs, délai de réponse 24h (la plaquette indique 48h) | Prompt 06 | En attente |
| 7 | Équipe : nom complet de Babou, présentations courtes éventuelles, autres membres | Prompt 06 | En attente |
| 8 | Confirmation de la liste d'équipement | Prompt 06 | En attente |
| 9 | Identifiants légaux pour les mentions légales : NINEA, RCCM, adresse du siège (à saisir dans `src/content/mentions-legales.ts`) | Prompt 06 (blocs masqués tant qu'ils manquent) | En attente |
| 10 | Validation par le client de toute la page Mentions légales, dont la durée de conservation des messages (24 mois après le dernier échange) l'adresse de l'hébergeur Vercel étant publiée depuis le Prompt 07 (D64) | Prompt 06 | En attente |
| 11 | Accès au DNS de manaprod.com (WordPress.com), demandé dès maintenant | Prompt 07 (Resend) et Prompt 14 (domaine) | En attente |
| 12 | Email : adresse d'expédition et adresse de réception des demandes (Resend retenu) | Prompt 07 | En attente |
| 13 | Adresse email de l'administrateur principal | Prompt 09 | En attente |
| 14 | Logos des 8 clients (PNG transparent recommandé, pas de SVG) | Prompt 11 (saisis dans le dashboard) | En attente |
| 15 | Version anglaise souhaitée en V2 ? | Hors V1 | En attente |

## 7. Registre des migrations

Claude Code ne marque jamais une migration comme exécutée : seul Ziza le confirme. Ordre d'exécution : de haut en bas.

| N° | Fichier | Objet | Exécutée par Ziza |
|---|---|---|---|
| 0001 | `supabase/migrations/0001_init.sql` | Migration de structure : tables, fonctions `is_admin()` et `set_updated_at()`, GRANT explicites, index, RLS, bucket `media` et ses policies (lecture par l'API réservée aux administrateurs). Corrigée au Prompt 01, avant toute exécution | Oui (2026-11-17) |
| 0001 (seed) | `supabase/seed/0001_seed.sql` | Données de départ : réglages, 8 projets, 8 clients, 3 membres de l'équipe. À exécuter après la migration `0001_init.sql` | Oui (2026-11-17, contrôle 1, 8, 8, 3) |
| 0002 | `supabase/migrations/0002_contact_rate_limit.sql` | Table `contact_submissions` (empreintes d'IP des envois récents du formulaire), RLS sans policy, accès réservé à la clé service. À exécuter après `0001_init.sql` | Non |

## 8. Variables d'environnement

Saisies par Ziza dans Vercel. Noms et commentaires dans `.env.example`.

| Variable | Usage | Côté | Nécessaire à partir du | Saisie par Ziza |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | URL du site (Vercel puis manaprod.com) | Public | Prompt 01 | Oui (URL Vercel) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Public | Prompt 03 | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (lecture soumise à la RLS) | Public | Prompt 03 | Oui |
| `CRON_SECRET` | Protège `/api/keepalive` | Serveur uniquement | Prompt 03 | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service, seul usage : formulaire de contact (messages et limitation des envois) | Serveur uniquement | Prompt 07 | À saisir (Prompt 07) |
| `RESEND_API_KEY` | Envoi des emails | Serveur uniquement | Prompt 07 | À saisir (Prompt 07) |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les demandes (amathndiaye@manaprod.com) | Serveur uniquement | Prompt 07 | À saisir (Prompt 07) |
| `CONTACT_FROM_EMAIL` | Adresse d'expédition (contact@manaprod.com, domaine vérifié dans Resend) | Serveur uniquement | Prompt 07 | À saisir (Prompt 07) |
