# PROJECT_STATE.md : état du projet Mana Prod

Dernière mise à jour : 2026-11-17, fin du Prompt 11.

## 1. Où en est le projet

- **Dernier prompt terminé** : Prompt 11 (dashboard, onglets Clients, Équipe et Messages, effacement automatique des messages). En attente de validation et du Go de Ziza.
- **Prochaine étape** : Prompt 12 (audit 2), après le Go.
- **Branche de travail** : `main` (développement, avant mise en ligne).
- **Code applicatif** : socle Next.js 16.4.6, en-tête, menu mobile, pied de page, bouton-lien, composants de mouvement, transition entre pages, page 404, utilitaires YouTube testés, types de la base, lectures mises en cache (réglages, projets, clients), accueil complet (hero, studio, sélection, clients, appel final), page Réalisations avec filtres, fiches projet, pages Services, Le studio, Mentions légales et Contact (formulaire, limitation des envois, emails Resend), route `/api/keepalive` et cron, intégration continue, site entier en `noindex`, authentification du dashboard (connexion, mot de passe oublié, proxy limité à `/admin`), dashboard complet (Showreel, Projets, Clients, Équipe, Réglages, Messages) publié immédiatement sur le site, effacement automatique des messages de plus de 24 mois.

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
| 07 | Contact | Formulaire, validation serveur, pot de miel, migration `0002_` de limitation des envois (IP hachée, purge), enregistrement en base, client Supabase service, emails avec Resend (notification et accusé de réception sans le message du visiteur) | Accès au DNS de manaprod.com (vérification du domaine dans Resend, MX intouchés), compte Resend, domaine vérifié, variables `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Fait, validé |
| 08 | Audit 1 | Contrôle complet des prompts 01 à 07 : sécurité, mobile 360 px, accessibilité, cohérence avec les prototypes | | Fait, validé |
| 09 | Authentification | Connexion, mot de passe oublié (`/admin/mot-de-passe-oublie`, `/admin/nouveau-mot-de-passe`), protection de `/admin`, coquille du dashboard (adresse de l'admin connecté, déconnexion), onglets Showreel et Réglages, revalidation du cache après chaque enregistrement | Compte administrateur créé dans Supabase Auth ; SMTP de Resend configuré dans Supabase Auth ; URL de redirection de l'authentification réglées ; SQL de déclaration de l'administrateur fourni dans le rapport (jamais commité) | Fait, validé |
| 10 | Admin projets | Onglet Projets complet : vidéos, téléversement des photos et de la miniature, livrables, ordre, publication, client et titre obligatoires, « Voir la page » désactivé si non publié | Exécution de `0003_project_photo_size.sql` | Fait, validé |
| 11 | Admin clients, équipe et messages | Onglets Clients (avec logos), Équipe, Messages | | Fait, en attente de validation |
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
- **Prompt 08 (audit 1)** :
  - Limite du formulaire à 5 envois par heure (D66), étape « délai » de « Et ensuite » lue dans `site_settings.reply_promise`.
  - Lien d'évitement « Aller au contenu » sur toutes les pages, page d'erreur (`src/app/error.tsx`, D68), en-têtes de sécurité HTTP (D67).
  - Lectures mises en cache sans erreur levée dans le cache (`cachedRead`, `unwrap`, D69) : une base indisponible ne bloque plus la réponse.
  - Corps de `/api/contact` limité même sans en-tête `content-length` ; message « variable manquante » unique (`missingVariableError`).
  - Transitions coupées avec `prefers-reduced-motion` ; `npm audit fix` (P7 résolu) ; actions GitHub en v7.
  - Lighthouse mobile (données simulées) : performance de 97 à 100 et accessibilité 100 sur les 7 pages publiques.
  - Décisions D66 à D69 ; constats détaillés dans le rapport du Prompt 08.
- **Prompt 09 (authentification et dashboard)** :
  - Pages publiques déplacées dans le groupe de routes `(site)` (en-tête et pied de page), le dashboard a sa propre mise en page (D72). Pages publiques toujours statiques.
  - `src/proxy.ts` limité à `/admin` : rafraîchissement de la session, redirection vers `/admin/login`, déconnexion d'un compte non administrateur (D70). `requireAdmin()` (`src/lib/admin/auth.ts`) dans chaque page protégée et chaque Server Action.
  - `/admin/login`, `/admin/mot-de-passe-oublie` (réponse identique que le compte existe ou non), route `/admin/confirmer` (lien token_hash, verifyOtp de type recovery, D74), `/admin/nouveau-mot-de-passe`.
  - Coquille : barre (logo, email du compte, « Ouvrir le site », « Déconnexion »), onglets Showreel et Réglages (latéraux, horizontaux sous 1000 px), notifications annoncées, alerte avant de quitter une page modifiée.
  - Onglet Showreel : lien YouTube (tous formats), titre, aperçu youtube-nocookie, « Retirer le showreel », conseil de visibilité.
  - Onglet Réglages : hero, chiffres clés (4 au maximum, ajout et retrait sans perte de saisie), coordonnées, promesse de réponse, changement du mot de passe (12 caractères minimum).
  - Validation zod partagée navigateur et serveur (`src/lib/admin/schemas.ts`, 14 tests, 100 au total) ; publication immédiate par `updateTag` (D71) vérifiée en local.
  - Décisions D70 à D76.
- **Prompt 10 (onglet Projets)** :
  - Migration `0003_project_photo_size.sql` (largeur et hauteur des photos, contraintes positives), validée deux fois sur Postgres 16 ; types mis à jour ; la fiche publique réserve la place exacte des photos quand les dimensions existent (D57 sinon) et lit les photos avec `*` (fonctionne avant comme après 0003).
  - `/admin/projets` : tous les projets dans l'ordre du site (miniature, client, titre, Publié ou Brouillon, À la une, catégorie, année, vidéos et photos), Monter et Descendre (ordre enregistré en une action), Voir la page, Modifier, Nouveau projet.
  - `/admin/projets/nouveau` et `/admin/projets/[id]` : informations, adresse générée et vérifiée (avertissement si un projet publié change d'adresse), livrables et vidéos (ajout, retrait, ordre, doublon refusé, aperçu), miniature et photos (téléversement direct vers `media`, compression WebP, progression, erreurs par fichier, texte alternatif, ordre, suppression), suppression du projet avec confirmation et nettoyage du stockage.
  - Server Actions `src/app/admin/project-actions.ts` (requireAdmin, zod, client à cookies, updateTag de `projects`, `project:<slug>` et de l'ancien slug) ; fonctions pures testées : slug, chemins de stockage, redimensionnement, déplacement (119 tests au total).
  - `requireAdmin()` appelle `connection()` (erreurs « Date.now() pendant le prérendu » supprimées) ; identifiants de l'éditeur uniques par instance ; notifications et liste cohérentes avec les pages gardées en mémoire par le routeur.
  - Décisions D77 à D83.
- **Prompt 11 (onglets Clients, Équipe et Messages)** :
  - Registre : 0003 exécutée. Identifiants uniques (`useId`) sur les pages d'accès et les formulaires Showreel et Réglages.
  - Site public : image des cartes de projet dans l'ordre miniature, première vidéo, première photo, carte typographique, la première photo étant lue dans la même requête (D84).
  - `/admin/clients` : liste ordonnable, ajout, nom, logo téléversé (520 px, WebP avec transparence, repli PNG), « Afficher en blanc », retrait, suppression ; aperçu tel que sur le bandeau (D85).
  - `/admin/equipe` : liste ordonnable, ajout, nom, titre, présentation courte (300 caractères), photo recadrée en 4:5 (position Haut, Centre ou Bas, aperçu exact), 1000 px de large ; les photos de départ (`/team/...`) ne sont jamais supprimées du bucket (D86).
  - `/admin/messages` : filtres Tous, À traiter, Traités, pagination par 30, date à l'heure de Dakar, message en texte brut, traité ou à traiter, répondre (mailto), suppression confirmée ; nombre de messages à traiter dans la navigation (D88).
  - `/api/keepalive` efface les messages de plus de 24 mois avec la clé service et renvoie seulement leur nombre (D87, P11 résolu).
  - Navigation dans l'ordre du cahier : Showreel, Projets, Clients, Équipe, Réglages, Messages. 136 tests au total.
  - Décisions D84 à D88.

## 4. Reste à faire

- Prompts 12 à 14 (voir la feuille de route).
- Recommandations de l’audit 1 non appliquées (rapport du Prompt 08) : CSP, code 404 à la première visite (P10).

## 5. Problèmes ouverts

| N° | Problème | Bloque | État |
|---|---|---|---|
| P1 | Vérification du domaine d'expédition dans Resend | Prompt 07 | Résolu : domaine vérifié, notification et accusé de réception reçus (Prompt 07) |
| P2 | Limitation de débit par IP sans stockage partagé dans `0001_init.sql` | Prompt 07 | Résolu au Prompt 07 : migration `0002_contact_rate_limit.sql` (D62), à exécuter par Ziza |
| P3 | Cron anti-pause prévu trop tard | Stabilité de la base | Résolu au Prompt 03 : route `/api/keepalive` et cron Vercel (production uniquement) |
| P4 | Page mentions légales absente de l'arborescence | Mise en ligne | Résolu dans le cahier v1.4 (D11) : Prompt 06 ; identifiants légaux à fournir |
| P5 | Écarts entre le cahier et le prototype du dashboard | Prompts 09 et 10 | Arbitré (D21, D22, D25, D27) : le cahier prime |
| P6 | Délai de réponse : 24h (site, base) ou 48h (plaquette) | Prompt 06 | Arbitré (D16) : 24h par défaut, à confirmer par le client |
| P7 | `npm audit` : vulnérabilité modérée de `minimatch` (dépendance des outils de lint) | Aucun | Résolu au Prompt 08 (`npm audit fix`, mise à jour mineure sans changement de version majeure) |
| P8 | Liens vers des pages pas encore créées (404 et erreurs de préchargement dans la console) | Aucun | Fermé au Prompt 07 : toutes les pages publiques existent |
| P9 | Fenêtre modale du showreel : quand le focus est dans le lecteur YouTube (après un clic dans la vidéo), Échap est reçue par la page de YouTube et ne ferme pas la fenêtre | Aucun (bouton de fermeture et clic sur le fond disponibles) | Limite connue des iframes d'un autre domaine (D51), acceptée sauf avis contraire |
| P10 | Première visite d'une adresse de fiche inexistante (`/realisations/nimporte-quoi`) : la page 404 s'affiche mais la réponse HTTP vaut 200, puis 404 aux visites suivantes (rendu en flux de Cache Components). La page porte `noindex` | Aucun pour le visiteur ; léger pour le référencement après la mise en ligne | À revoir au Prompt 13 (qualité, SEO) |
| P11 | Les mentions légales annoncent une conservation des messages de 24 mois, mais aucun effacement automatique n'existait | Conformité | Résolu au Prompt 11 : `/api/keepalive` efface les messages de plus de 24 mois tous les 6 jours (D87) |
| P12 | Pas de politique de sécurité du contenu (CSP) | Aucun à court terme | Recommandation : la définir au Prompt 13 (YouTube, Supabase, styles de Next.js) |
| P13 | La page d'erreur, comme la 404 d'une première visite (P10), répond avec le code 200 sur un rendu à la demande (rendu en flux) | Aucun pour le visiteur | À revoir au Prompt 13 avec P10 |
| P14 | Après une déconnexion, le routeur peut demander deux préchargements de `/admin/login` qui répondent 404 (console du navigateur, observé une fois en local). La page de connexion s'affiche normalement | Aucun | À observer sur Vercel ; à revoir à l'audit 2 (Prompt 12) |

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
| 11 | Accès au DNS de manaprod.com (WordPress.com) | Prompt 07 (Resend) et Prompt 14 (domaine) | Obtenu : utilisé pour Resend, à réutiliser au Prompt 14 |
| 12 | Email : adresse d'expédition et adresse de réception des demandes (Resend retenu) | Prompt 07 | En attente |
| 13 | Adresse email de l'administrateur principal | Prompt 09 | Obtenu : premier administrateur Ziza (adresse personnelle, déclarée par SQL hors dépôt) ; Amath ajouté plus tard par le même SQL |
| 14 | Logos des 8 clients (PNG transparent recommandé, pas de SVG) | Saisie dans le dashboard (onglet Clients, depuis le Prompt 11) | En attente |
| 15 | Version anglaise souhaitée en V2 ? | Hors V1 | En attente |

## 7. Registre des migrations

Claude Code ne marque jamais une migration comme exécutée : seul Ziza le confirme. Ordre d'exécution : de haut en bas.

| N° | Fichier | Objet | Exécutée par Ziza |
|---|---|---|---|
| 0001 | `supabase/migrations/0001_init.sql` | Migration de structure : tables, fonctions `is_admin()` et `set_updated_at()`, GRANT explicites, index, RLS, bucket `media` et ses policies (lecture par l'API réservée aux administrateurs). Corrigée au Prompt 01, avant toute exécution | Oui (2026-11-17) |
| 0001 (seed) | `supabase/seed/0001_seed.sql` | Données de départ : réglages, 8 projets, 8 clients, 3 membres de l'équipe. À exécuter après la migration `0001_init.sql` | Oui (2026-11-17, contrôle 1, 8, 8, 3) |
| 0002 | `supabase/migrations/0002_contact_rate_limit.sql` | Table `contact_submissions` (empreintes d'IP des envois récents du formulaire), RLS sans policy, accès réservé à la clé service. À exécuter après `0001_init.sql` | Oui (2026-11-17) |
| 0003 | `supabase/migrations/0003_project_photo_size.sql` | Colonnes `width` et `height` de `project_photos` (nullables, strictement positives si renseignées). À exécuter après `0002` | Oui (2026-11-17) |

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
