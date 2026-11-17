# CLAUDE.md : règles du projet Mana Prod

Ce fichier est lu au début de chaque prompt. Il résume les règles tirées de `docs/methode-de-developpement.md` (qui prime pour tout le processus) et de `docs/cahier-des-charges-manaprod.md` (référence unique pour le fonctionnel, le design et la sécurité). En cas de doute, ces deux documents font foi.

## 1. Le projet

Site vitrine de MANA PROD, agence de production audiovisuelle à Dakar dirigée par Amath NDIAYE. Six pages publiques et un dashboard d'administration protégé.

| Route | Rôle |
|---|---|
| `/` | Accueil |
| `/realisations` | Liste des projets avec filtres |
| `/realisations/[slug]` | Fiche projet |
| `/services` | Services, méthode, pourquoi Mana Prod |
| `/studio` | Présentation, chiffres, équipe, équipement |
| `/contact` | Contact et formulaire |
| `/admin` | Dashboard (protégé) |
| `/admin/login` | Connexion |
| `/api/contact` | Réception du formulaire |
| `/api/keepalive` | Maintien de la base active (cron tous les 6 jours) |

Documents de référence : `docs/reference/manaprod-site.html` (fait foi pour le visuel, les textes et les interactions du site), `docs/reference/manaprod-dashboard.html` (fait foi pour l'organisation et le comportement de l'admin), `docs/reference/logo/LISEZ-MOI.md` (règles du logo), `docs/reference/presentation-manaprod.pdf` (plaquette).

Règle d'or : en cas de contradiction entre le cahier et les prototypes, le cahier prime pour le fonctionnel et la sécurité, le prototype prime pour le visuel et les textes. La contradiction est notée dans `decisions.md`.

## 2. Environnement de travail

- Aucun travail en local. Claude Code web écrit directement sur le dépôt GitHub. Rien ne s'exécute sur la machine de Ziza : jamais de commande à lui faire lancer.
- Vercel est relié à GitHub : chaque push déclenche un déploiement. L'URL Vercel est le seul environnement de test.
- Supabase sans CLI : Ziza exécute chaque migration en copiant le fichier SQL dans le SQL Editor de Supabase.
- Les variables d'environnement sont saisies par Ziza dans Vercel. Claude Code n'y a pas accès.

## 3. Stack

| Domaine | Choix |
|---|---|
| Framework | Next.js (App Router), TypeScript strict |
| Style | Tailwind CSS avec tokens CSS (variables) |
| Animation | Framer Motion pour toutes les animations, respect de `prefers-reduced-motion` |
| Base, authentification, stockage | Supabase (Postgres, Auth email et mot de passe, Storage bucket `media`) |
| Hébergement | Vercel (avec Vercel Cron pour `/api/keepalive`) |
| Emails | Resend |
| Vidéos | YouTube, lecteur `youtube-nocookie.com` |
| Validation | zod |
| Icônes | lucide-react, au trait uniquement |
| Tests | Vitest pour les fonctions pures (à commencer par les utilitaires YouTube) |
| Police | Schibsted Grotesk auto-hébergée via `next/font` |

Toute autre technologie ou dépendance doit être justifiée dans `decisions.md` et demandée par le prompt.

## 4. Règles absolues (méthode, section 4)

1. **Qualité avant vitesse.** Ne jamais bâcler, quitte à faire plus de prompts.
2. **Fonctionnalités complètes.** Aucun bouton factice, aucun composant vide, aucun `TODO`, aucune donnée simulée présentée comme réelle. Seule exception : un contenu listé « à fournir », affiché proprement et listé dans `PROJECT_STATE.md`.
3. **Cohérence interface et serveur.** Chaque action de l'interface a son traitement serveur (Server Action, route handler ou requête protégée par RLS), et inversement. Aucun code mort, aucune route orpheline.
4. **Tout dans le même prompt.** Un fichier qui doit changer pour que la fonctionnalité marche change dans le même prompt.
5. **Zéro erreur avant push.** `npm run lint`, `npx tsc --noEmit`, `npm run build` passent sans erreur, ainsi que `npm run test` si des tests existent.
6. **Décisions.** Décision mineure et réversible non couverte : choisir l'option la plus simple et la noter dans le rapport. Décision structurante, irréversible ou métier : s'arrêter et demander. Ne jamais inventer une règle métier.
7. **Git.** Un commit clair par prompt, poussé sur la branche indiquée. Jamais de force push, jamais de réécriture d'historique.
8. **Un lot à la fois.** Si le lot ne peut pas être terminé proprement, s'arrêter à un état stable qui compile, et le dire.
9. **Pas d'initiative hors périmètre.** Pas de refactorisation, renommage, dépendance ou amélioration non demandés. Un problème vu ailleurs est signalé dans le rapport, pas corrigé.

## 5. Conséquences de l'environnement (méthode, section 2)

- **Migrations** : fichiers numérotés dans `supabase/migrations/` (`0001_init.sql`, puis `0002_...`). Chaque fichier est autonome, idempotent, exécutable en un seul copier-coller, dans l'ordre. Une migration exécutée n'est jamais modifiée : on en crée une nouvelle.
- **Données de départ** : dans `supabase/seed/`, séparées de la structure, idempotentes.
- **Types** : écrits à la main dans `src/types/database.ts`, mis à jour dans le même prompt que la migration.
- **Build sans secrets** : le build réussit sans aucune variable d'environnement. Une variable manquante lève une erreur claire à l'exécution, jamais à l'import. Toute nouvelle variable est ajoutée à `.env.example` et signalée dans le rapport.
- **Tests sur Vercel** : chaque rapport dit exactement quoi tester sur l'URL Vercel, dans quel ordre, avec le résultat attendu.
- **Retour arrière** : `git revert` du commit fautif, jamais de réécriture d'historique.
- **Registre des migrations** : Claude Code ne marque jamais une migration comme exécutée. Seul Ziza le confirme, et l'information arrive par le prompt suivant.

## 6. Leçons apprises (méthode, section 5)

- **Mobile first** : responsive dès la création, vérification à 360 px, cibles tactiles de 44 px minimum, modales limitées à `max-h-[85vh]` avec défilement interne, aucune largeur fixe sans point de rupture. Aucun défilement horizontal de 360 à 1920 px. Points de rupture du projet : 560, 700, 820 et 1000 px.
- **Dates** : une date sans heure se parse avec `new Date(date + "T12:00:00")`. Affichage en `fr-FR`.
- **SQL Supabase** : `DROP POLICY IF EXISTS` puis `CREATE POLICY` ; `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE OR REPLACE FUNCTION`, `DROP TRIGGER IF EXISTS` avant `CREATE TRIGGER` ; buckets créés avec `ON CONFLICT DO NOTHING`. Toute migration est réexécutable sans erreur.
- **RLS** : activée sur toutes les tables. Chaque policy traduit la règle métier complète (ex. `published` dans la lecture publique des projets). Ne jamais compter sur un filtre côté client.
- **Clés** : `SUPABASE_SERVICE_ROLE_KEY` reste côté serveur, jamais dans une variable `NEXT_PUBLIC_`, jamais importée dans un composant client. Aucune clé dans le code ni dans le dépôt.
- **Storage** : chaque bucket a ses policies. Images compressées avant envoi. Domaines Supabase et `i.ytimg.com` déclarés dans la configuration `next/image`.
- **Notifications** : ne notifier que ce qui est réellement visible.
- **Formulaires** : validation serveur (zod) en plus du client, messages d'erreur qui disent quoi corriger, anti-spam sur les formulaires publics (champ piège et limitation des envois).
- **Audits** : après chaque lot, parcours complet en lisant le code comme un utilisateur, du premier clic au résultat en base.
- **Libellés** : un même concept porte le même libellé partout (site, admin, emails).
- **Infrastructure** : vérifier DNS, redirections, domaines et URL de redirection de l'authentification Supabase en navigation privée.
- **Images et logo** : `next/image` avec dimensions ou ratio fournis, jamais d'étirement. Le logo n'est jamais déformé, recoloré ni recadré : on fixe sa largeur ou sa hauteur, jamais les deux.
- **Identité** : icônes au trait uniquement, jamais d'emoji. Jamais de tiret long ni de tiret moyen.
- **Accessibilité (WCAG AA)** : navigation clavier complète, focus visible (contour turquoise), textes alternatifs, libellés de formulaires, `aria-live` pour les erreurs, modales avec piégeage du focus et fermeture par Échap, contrastes AA, `prefers-reduced-motion`.
- **SEO** : titre et description par page, Open Graph et Twitter cards, `sitemap.xml` dynamique, `robots.txt` (dashboard exclu et en `noindex`), données structurées Organization et VideoObject.
- **Performance** : formats modernes, chargement différé, iframes YouTube en façade, pas de dépendance lourde sans raison. Objectif Lighthouse mobile 90 ou plus, LCP inférieur à 2,5 s, CLS inférieur à 0,1.

## 7. Règles propres à Mana Prod (cahier, section 14)

### Base de données
- Migration fournie : `supabase/migrations/0001_init.sql`. Données de départ : `supabase/seed/0001_seed.sql`, à exécuter après la migration. Les migrations suivantes commencent à `0002_`.
- Écriture réservée aux administrateurs (table `admin_users`, fonction `is_admin()`).
- `contact_messages` : aucune lecture ni écriture publique. Insertion par `/api/contact` côté serveur avec la clé service. Lecture, mise à jour et suppression réservées aux admins.
- Bucket `media` public : fichiers servis par leur URL publique ; par l'API, lecture, écriture et suppression réservées aux administrateurs ; SVG exclus (JPEG, PNG, WebP, AVIF, 10 Mo maximum). Droits d'accès aux tables accordés par GRANT explicites dans les migrations, la RLS restant la seule règle métier. Dossiers : `projects/{id}/`, `thumbs/`, `clients/`, `team/`. Les chemins sont stockés en base, les URL sont construites côté application.
- Un chemin d'image qui commence par `/` désigne un fichier du dossier `public` (photos de l'équipe de départ, dans `public/team/`), sinon un fichier du bucket `media`.
- Catégories autorisées (contrainte SQL) : Film institutionnel, Film corporate, Spot publicitaire, Film publicitaire, Documentaire, Reportage industriel, Couverture événement, Motion design, Photographie, Campagne multi-supports.
- Toute modification enregistrée dans le dashboard est visible sur le site en moins de 10 secondes : revalidation du cache Next.js par étiquette à chaque enregistrement.
- Lectures publiques : fonctions `"use cache"` de `src/lib/data/`, avec `cacheTag` (constantes de `src/lib/data/tags.ts`) et `cacheLife` explicite, via `publicDataClient()` (`src/lib/data/source.ts`, client sans session `src/lib/supabase/public.ts`), qui applique la règle des variables absentes (D43, D47). Toute URL d'image tirée d'un chemin en base passe par `mediaUrl()` (`src/lib/media.ts`). Le client à cookies (`src/lib/supabase/server.ts`) n'est jamais utilisé dans une fonction `"use cache"`.

### Code et contenu
- TypeScript strict, composants serveur par défaut, Server Actions pour le dashboard, validation avec zod.
- Framer Motion pour toutes les animations ; avec `prefers-reduced-motion`, toutes les animations sont coupées et le bandeau clients devient une grille.
- Icônes lucide-react au trait, aucun emoji. Aucun tiret long ni tiret moyen, dans le code, les textes, les commentaires et les commits.
- Textes en français, accents corrects, apostrophe typographique (’) dans les textes affichés.
- Zéro placeholder de contenu, zéro `TODO`, zéro contenu client inventé : uniquement les textes de la section 9 du cahier, du prototype et de la base de données. Les blocs vides sont masqués.
- Pour tout travail d'interface, ouvrir le prototype correspondant dans `docs/reference/` et s'y conformer.
- Structure qui n'empêche pas une future version anglaise ou wolof (V2), sans l'implémenter.

### Charte
- Tokens : `--bg #0A1013`, `--bg-2 #10191D`, `--bg-3 #18262C`, `--line #223239`, `--text #EDF2F3`, `--muted #8FA3A8`, `--teal #2EC4CF` (accent unique), `--teal-hi #5AD6DF`, `--ink #04161A` (texte sur turquoise), `--danger #FF7A6B`.
- Un seul accent turquoise. Pas de dégradés décoratifs, sauf la lumière animée du hero de repli. Aucun rendu « AI slop » : pas de dégradés violets, pas de cartes arrondies à ombres, pas de typographie générique, pas de textes creux.
- Schibsted Grotesk (400 à 900), interlettrage `-0.035em` sur les grands titres, corps 18 px.
- Angles droits partout (boutons, champs, cartes). Filets de 1 px. Boutons-liens : cadre fin et carré blanc avec flèche, qui passe au turquoise au survol. Aucun soulignement décoratif.
- Logo Éclipse : composant `Logo` (horizontal) dans l'en-tête, le pied de page et le dashboard, textes en `currentColor`, anneau `#2EC4CF`, disque `#060A0C`. Ne jamais colorer MANA ou PROD en turquoise, ne jamais déformer le logo, ne jamais utiliser la version avec halo hors écran.

### Vérifications et blocages
- Avant chaque commit : lint, `tsc --noEmit`, build, tests Vitest dès qu'ils existent.
- Blocage externe (clé manquante, réglage Supabase, Vercel, Resend, DNS) : aucune valeur inventée, code complet qui fonctionnera dès que l'élément sera fourni, action pas à pas dans « Actions pour Ziza ».

## 8. Protocole de chaque prompt (méthode, section 7)

1. Lire `CLAUDE.md`, `PROJECT_STATE.md` et `decisions.md`. Citer en 3 lignes les règles qui s'appliquent à la tâche.
2. Vérifier être sur la branche indiquée dans le prompt, à jour.
3. Lire les fichiers concernés (et le prototype pour toute interface) avant de coder.
4. Exécuter la tâche, rien de plus, rien de moins.
5. `npm run lint`, `npx tsc --noEmit`, `npm run build` (et `npm run test` si présent) : zéro erreur.
6. Mettre à jour `PROJECT_STATE.md`, et `decisions.md` si une décision a été prise.
7. `git add .`, `git commit -m "[type]: [description précise]"`, `git push origin [branche]`.
8. Rédiger le rapport, puis attendre le Go.

### Format du rapport (méthode, section 9)
1. Fait : une ligne par point implémenté.
2. Fichiers modifiés : liste et nombre.
3. Vérifications : lint, types, build, tests (OK ou erreur).
4. Actions pour Ziza : migrations à exécuter (chemin exact, dans l'ordre), variables à ajouter dans Vercel (nom, rôle, où trouver la valeur), réglages Supabase ou autres services.
5. Comment tester : parcours précis sur l'URL Vercel, avec le résultat attendu.
6. Décisions prises et ambiguïtés restantes.
7. Problèmes rencontrés et solution appliquée.
8. Signalements hors périmètre.
9. Commit : hash et branche.

## 9. Conventions de commit

- Messages en français, format `type: description précise`.
- Types : `feat` (fonctionnalité), `fix` (correctif), `db` (migration), `content` (contenus), `docs` (documentation), `chore` (configuration).
- Un commit par prompt. Aucun emoji, aucun tiret long ni tiret moyen.

## 10. Stratégie de branches

| Phase | Branche |
|---|---|
| Développement, avant mise en ligne | `main` : chaque push est un test sur l'URL Vercel |
| Après mise en ligne | une branche par lot (`feat/...`, `fix/...`), prévisualisation Vercel, puis fusion dans `main` |

La branche à utiliser est toujours écrite explicitement dans chaque prompt. Pas de pull request avant la mise en ligne.

## 11. Règles de sécurité

- Aucune clé, aucun mot de passe, aucun identifiant de compte dans le dépôt. `.env*` est ignoré par git, sauf `.env.example` (noms de variables sans valeurs).
- `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` et `CRON_SECRET` restent côté serveur : jamais de préfixe `NEXT_PUBLIC_`, jamais d'import dans un composant client (utiliser `server-only`).
- RLS activée sur toutes les tables, policies relues à chaque migration. Écriture uniquement via `is_admin()`.
- `/admin` et toutes ses Server Actions vérifient la session et l'appartenance à `admin_users` côté serveur, à chaque appel.
- `/api/contact` : validation zod, champ piège, limitation de débit par IP, longueurs maximales, aucun HTML non échappé dans les emails.
- `/api/keepalive` : protégée par `CRON_SECRET` (en-tête `Authorization: Bearer`).
- Dashboard exclu de l'indexation (`robots.txt` et `noindex`). Aucun lien public vers `/admin`. Jusqu'à la mise en ligne (Prompt 14), tout le site est en `noindex, nofollow` (D31).
- Le SQL de déclaration d'un administrateur contient un identifiant de compte : il est fourni dans le rapport, jamais commité.
