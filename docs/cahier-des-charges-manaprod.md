# Cahier des charges : site web MANA PROD

Version 1.7 | 17 novembre 2026 | Alignée sur la méthode de développement Ziza × Claude × Claude Code | Logo Éclipse

---

## 0. Comment utiliser ce document

Ce document est la référence unique du projet pour le fonctionnel, le design et la sécurité. La façon de travailler (rôles, prompts, rapports, migrations, branches) est décrite dans `docs/methode-de-developpement.md`, qui prime pour tout ce qui concerne le processus. Claude Code relit les fichiers mémoire (`CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`) au début de chaque prompt ; il les crée lui-même au Prompt 00.

Contenu du dépôt au démarrage (déposé par Ziza) :

| Chemin | Rôle |
|---|---|
| `docs/cahier-des-charges-manaprod.md` | Ce document |
| `docs/methode-de-developpement.md` | Méthode de travail Ziza × Claude × Claude Code |
| `docs/reference/manaprod-site.html` | Prototype du site public : fait foi pour le design, les textes et les interactions |
| `docs/reference/manaprod-dashboard.html` | Prototype du dashboard : fait foi pour l'organisation et le comportement de l'admin |
| `docs/reference/presentation-manaprod.pdf` | Plaquette de l'entreprise |
| `docs/reference/logo/` | Dossier complet du logo Éclipse : `svg/` (logo empilé, logo horizontal, symbole, en 5 versions), `png/`, `icones/` (favicon, icône app, photo de profil), `LISEZ-MOI.md` (règles d’usage) |
| `docs/reference/team/*.jpg` | Photos de l'équipe, recadrées en 4:5 (1200 x 1500) |
| `supabase/migrations/0001_init.sql` | Migration de structure : tables, fonctions, index, droits d'accès (GRANT explicites), sécurité (RLS), bucket de stockage `media` |
| `supabase/seed/0001_seed.sql` | Données de départ : réglages, 8 projets, 8 clients, 3 membres de l'équipe |

Ziza travaille uniquement en ligne : Claude Code web est connecté au dépôt GitHub `tracescreatifs/Manaprod` et écrit directement dessus, Vercel déploie chaque push, l'URL Vercel est le seul environnement de test. Rien ne s'exécute sur la machine de Ziza.

Règle d'or : en cas de contradiction entre ce document et les prototypes, le document prime pour le fonctionnel et la sécurité, le prototype prime pour le visuel et les textes. La contradiction est notée dans `decisions.md`.

Les arbitrages pris après le Prompt 00 (décisions D08 à D31 de `decisions.md`) sont intégrés depuis la version 1.4. La version 1.5 intègre la renumérotation de la feuille de route décidée au Prompt 02 (décision D36) : les numéros de prompt cités dans ce document suivent la nouvelle numérotation. La version 1.6 intègre les corrections de l'audit 1 (Prompt 08).

---

## 1. Contexte et objectifs

**Client** : MANA PROD, agence de production audiovisuelle basée à Dakar, dirigée par Amath NDIAYE, vidéaste et monteur professionnel.

**Signature** : « C'est toujours celui qui éclaire qui demeure dans l'obscurité. »

**Coordonnées** : +221 78 011 43 08, amathndiaye@manaprod.com, Dakar, Sénégal. Promesse de réponse : sous 24h.

**Situation actuelle** : manaprod.com affiche une page « bientôt disponible » WordPress.com.

**Objectifs du site**
1. Montrer le travail (vidéo en premier) avec un rendu moderne, dynamique et crédible face à des clients institutionnels (UNICEF, banques, grandes entreprises).
2. Générer des demandes de contact qualifiées.
3. Permettre à l'équipe de mettre le site à jour seule, sans développeur : showreel, réalisations, clients, équipe.

**Contraintes de ton et de style (non négociables)**
- Aucun rendu « AI slop » : pas de dégradés violets, pas de cartes arrondies à ombres, pas de typographies génériques, pas de textes creux.
- Site en français. Aucun emoji, icônes SVG au trait uniquement. Aucun tiret long dans les textes.
- Mobile-first.

---

## 2. Périmètre

### Inclus
- Site public multipage (accueil, réalisations, fiche projet, services, studio, contact).
- Dashboard d'administration protégé (showreel, projets, clients, équipe, réglages, messages reçus).
- Base de données, stockage des images, authentification.
- Formulaire de contact avec enregistrement et notification par email.
- SEO technique, accessibilité, performance.
- Mise en ligne sur manaprod.com.

### Exclus de la V1 (évolutions possibles)
- Version anglaise et wolof du site (prévoir une structure qui ne l'empêche pas).
- Blog ou actualités.
- Prise de rendez-vous en ligne.
- Hébergement des vidéos (elles restent sur YouTube).

---

## 3. Stack technique

| Domaine | Choix |
|---|---|
| Framework | Next.js (App Router), TypeScript strict |
| Style | Tailwind CSS avec tokens CSS (variables) |
| Animation | Framer Motion (obligatoire pour toutes les animations) |
| Base de données | Supabase (Postgres), région Paris (`eu-west-3`) |
| Authentification | Supabase Auth (email et mot de passe) |
| Stockage images | Supabase Storage |
| Hébergement | Vercel, fonctions en région Paris (`cdg1`) |
| Email transactionnel | Resend (à confirmer, voir section 15) |
| Vidéos | YouTube (liens collés dans le dashboard) |
| Dépôt | GitHub, push direct sur `main`, sans pull request |

**Tâche récurrente anti-pause Supabase** : un cron tous les 6 jours qui fait une requête simple sur la base (route `/api/keepalive` appelée par Vercel Cron), en place dès le Prompt 03. Depuis le Prompt 11, cette requête efface les messages de contact reçus il y a plus de 24 mois (D87).

**Environnement** : développement exclusivement en ligne, rien à exécuter sur la machine de Ziza. Les variables d'environnement sont saisies par Ziza dans les interfaces web de Vercel et Supabase, Claude Code fournit un fichier `.env.example` commenté.

**Variables d'environnement**

| Variable | Usage | Nécessaire à partir du |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Prompt 03 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (lecture) | Prompt 03 |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service, serveur uniquement, jamais dans une variable `NEXT_PUBLIC_`. Seul usage : formulaire de contact (enregistrement des messages et limitation des envois, D62, D66) | Prompt 07 |
| `NEXT_PUBLIC_SITE_URL` | URL du site (prévisualisation puis manaprod.com) | Prompt 01 |
| `CRON_SECRET` | Protège la route `/api/keepalive` | Prompt 03 |
| `RESEND_API_KEY` | Envoi des emails | Prompt 07 |
| `CONTACT_TO_EMAIL` | Adresse qui reçoit les demandes | Prompt 07 |
| `CONTACT_FROM_EMAIL` | Adresse d'expédition (domaine vérifié dans Resend) | Prompt 07 |

Aucune clé dans le code ni dans le dépôt. Le build réussit sans aucune de ces variables : une variable manquante lève une erreur claire à l'exécution, jamais à l'import.

**Fichiers statiques** : un chemin d'image qui commence par `/` désigne un fichier du dossier `public` du site (photos de l'équipe de départ), sinon un fichier du bucket Supabase `media`.

---

## 4. Identité visuelle

### 4.1 Logo : Éclipse
Nouveau logo : un disque d’ombre cerné d’un anneau de lumière turquoise, avec un point brillant (« celui qui éclaire demeure dans l’obscurité »). Le nom MANA PROD est vectorisé à partir de Schibsted Grotesk (MANA en 800, PROD en 500). Tous les fichiers sont dans `docs/reference/logo/`, avec leurs règles dans `docs/reference/logo/LISEZ-MOI.md`.

Usage sur le site :
- **En-tête, pied de page, dashboard** : logo horizontal. Le prototype l’intègre en SVG avec les textes en `currentColor` (constante `LOGO`) : en faire un composant React `Logo`, l’anneau reste turquoise `#2EC4CF` et le disque `#060A0C`. Sur fond sombre, MANA prend la couleur du texte et PROD la couleur `#8FA3A8` (charte du logo), et non une opacité de 60 % comme dans le prototype.
- **Filigrane du hero de repli** : le symbole seul en blanc, opacité 6 % (constante `SYM` du prototype).
- **Favicon et icônes** : `docs/reference/logo/icones/` (`favicon.ico`, `favicon.svg`, `apple-touch-icon-180.png`, `icone-app-512.png`). Image de partage par défaut : construite à partir du logo empilé sur fond `#0A1013`.
- **Ne jamais** colorer MANA ou PROD en turquoise, déformer le logo, ou utiliser la version avec halo hors écran.

### 4.2 Palette (tokens)
```
--bg:        #0A1013
--bg-2:      #10191D
--bg-3:      #18262C
--line:      #223239
--text:      #EDF2F3
--muted:     #8FA3A8
--teal:      #2EC4CF   (accent unique)
--teal-hi:   #5AD6DF
--ink:       #04161A   (texte sur fond turquoise)
--danger:    #FF7A6B
```
Un seul accent (turquoise). Pas de dégradés décoratifs, sauf la lumière animée du hero de repli.

### 4.3 Typographie
Prototype : **Schibsted Grotesk** (400 à 900), largeur normale, interlettrage serré sur les grands titres (`-0.035em`), corps 18 px.

Point à confirmer par Ziza : la police ne doit pas faire « IA ». Les conventions habituelles de Ziza (Fraunces + Jost ou Archivo) sont une alternative possible. Ne pas changer sans validation.

### 4.4 Principes de design
- Éditorial : grands titres, filets fins de 1 px, grandes images, très peu de couleurs.
- Angles droits : boutons, champs et cartes sans arrondi (le bouton play du hero est carré).
- Boutons-liens : cadre fin + carré blanc contenant une flèche, qui passe au turquoise au survol.
- Aucun soulignement décoratif sous les liens.

### 4.5 Mouvement (Framer Motion)
- Apparition des sections au défilement (opacité + déplacement de 20 px).
- Titre du hero révélé mot par mot (masque, décalage de 60 ms par mot).
- Transition douce entre pages (opacité + 14 px).
- Bandeau défilant infini des logos clients, en pause au survol, avec fondu sur les bords.
- Compteurs animés sur la page Studio (montée de 0 à la valeur en 1,3 s, quand l'élément est visible à 60 %).
- Aperçu vidéo muet au survol d'un projet (souris uniquement, délai 450 ms).
- Respect de `prefers-reduced-motion` : toutes les animations sont coupées, le bandeau devient une grille.

---

## 5. Arborescence

| Route | Page |
|---|---|
| `/` | Accueil |
| `/realisations` | Liste des projets avec filtres |
| `/realisations/[slug]` | Fiche projet |
| `/services` | Services, méthode, pourquoi Mana Prod |
| `/studio` | Présentation, chiffres, équipe, équipement |
| `/contact` | Contact et formulaire |
| `/mentions-legales` | Mentions légales et confidentialité |
| `/admin` | Dashboard (protégé) |
| `/admin/login` | Connexion |
| `/admin/mot-de-passe-oublie` | Demande de réinitialisation du mot de passe (envoi d'un email) |
| `/admin/nouveau-mot-de-passe` | Choix d'un nouveau mot de passe (lien reçu par email) |
| `/api/contact` | Réception du formulaire |
| `/api/keepalive` | Maintien de la base active et effacement des messages de plus de 24 mois (cron tous les 6 jours) |

Menu : Réalisations, Services, Le studio, Contact. Aucun lien vers l'admin sur le site public : accès par URL uniquement.

Jusqu'à la mise en ligne (Prompt 14), tout le site est en `noindex, nofollow`, l'URL Vercel étant publique.

---

## 6. Spécifications des pages publiques

### 6.1 En-tête
- Fixe. Transparent sur le hero, devient opaque avec flou après 60 px de défilement. Opaque en permanence sur les autres pages.
- Logo à gauche, 4 liens à droite, lien actif souligné en turquoise.
- Mobile : bouton menu, menu plein écran avec liens en très grand.

### 6.2 Accueil
1. **Hero plein écran** (100 svh) :
   - Vidéo showreel YouTube en arrière-plan : muette, en boucle, sans contrôles, plein cadre (cover), via `youtube-nocookie.com`.
   - Ligne au-dessus : « Mana Prod, production audiovisuelle à Dakar ».
   - Titre : la signature, révélé mot par mot.
   - Bouton carré play + titre du showreel + « Lecture avec le son » : ouvre une fenêtre modale avec la vidéo avec son. Échap pour fermer.
   - **Repli sans showreel** : fond sombre avec une lumière turquoise qui dérive lentement et le logo en filigrane (opacité 6 %).
   - **Performance** : le texte du hero est rendu côté serveur ; l'iframe YouTube n'est chargée qu'ensuite, pour préserver le LCP.
2. **Le studio** : phrase d'accroche (voir section 9) et bouton-lien « Découvrir le studio ».
3. **Sélection** : projets publiés marqués « à la une » dans le dashboard ; s'il n'y en a aucun, les 6 premiers projets publiés selon leur ordre. Grille éditoriale, bouton-lien « Toutes les réalisations ».
4. **Ils nous font confiance** : bandeau défilant des clients (logo si présent, sinon nom en texte).
5. **Appel final** : « Parlons de votre projet » en très grand, lien vers /contact, rappel de la promesse de réponse.

### 6.3 Réalisations
- Titre, compteur (« 8 projets pour des institutions, des banques et des marques. »).
- Filtres par catégorie (uniquement les catégories utilisées), filtre actif souligné.
- Grille éditoriale 12 colonnes avec rythme 7/5, 5/7 (sur mobile : une colonne).
- Chaque vignette : image (miniature), titre, ligne « Client, catégorie, année », nombre de vidéos et de photos, étiquette « Voir le projet » au survol, aperçu vidéo muet au survol si le projet a une vidéo.
- Vignette de repli sans image : fond dégradé sombre, icône play, nom du client.
- Pagination inutile en V1 (moins de 40 projets), prévoir le chargement progressif si on dépasse.

### 6.4 Fiche projet
Ordre des blocs :
1. Lien retour « Réalisations ».
2. Titre très grand.
3. Méta : Client, Catégorie, Année.
4. **Vidéo principale** : façade (miniature YouTube + bouton play), le clic charge le lecteur.
5. **Le projet** : description (2 à 3 phrases, paragraphes séparés par saut de ligne). Masqué si vide.
6. **Livrables** : liste numérotée (01, 02, ...). Masqué si vide.
7. **Autres vidéos** : grille de 2 colonnes, même principe de façade, titre sous chaque vidéo.
8. **Photos** : maçonnerie en 3 colonnes, clic ouvre une visionneuse (flèches clavier, Échap, compteur).
9. **Projet suivant** : très grand nom du client du projet suivant.
- Si le projet n'a ni vidéo ni photo : message « Les contenus de ce projet arrivent bientôt ».
- Métadonnées SEO et image de partage par projet.

### 6.5 Services
- Titre, phrase d'introduction.
- Liste des 6 services (titre très grand à gauche, description à droite, filets séparateurs, titre turquoise au survol).
- « Comment nous travaillons » : 4 étapes numérotées (Brief, Tournage, Post-production, Livraison).
- « Pourquoi Mana Prod » : 4 arguments en deux colonnes.

### 6.6 Le studio
- Titre, bloc de présentation (« Une signature visuelle forte. » + 2 paragraphes).
- « En chiffres » : 4 valeurs animées (voir section 9).
- « Français et wolof ».
- **L'équipe** : grille de portraits 4:5 (photo, nom, titre en turquoise, présentation courte facultative). Initiales sur fond sombre si pas de photo.
- « Équipement » : liste en deux colonnes (catégorie, détail).

### 6.7 Contact
- Titre « Parlons de votre projet », phrase d'accroche avec la promesse de réponse.
- Colonne gauche : lignes téléphone (bouton WhatsApp à côté, lien `https://wa.me/221780114308`), email (bouton Copier), localisation. Bloc « Et ensuite » en 3 étapes.
- Colonne droite : formulaire dans un panneau : Nom, Organisation, Email, Type de projet (liste des catégories + Autre), Date souhaitée (facultatif), Message.
- Validation : nom, email valide et message obligatoires, message d'erreur clair.
- **Envoi (évolution par rapport au prototype)** : enregistrement en base + email de notification à l'adresse de contact + accusé de réception au visiteur. L'accusé de réception ne reprend jamais le contenu du message du visiteur (pour qu'il ne puisse pas servir de relais de spam). Anti-spam : champ piège (honeypot), limitation de débit par IP, validation serveur. La limitation s'appuie sur une table des envois récents (migration `0002_`, Prompt 07) qui ne stocke qu'une empreinte (hachage) de l'IP, jamais l'IP en clair, avec purge des lignes anciennes et sans service externe.
- Message de confirmation dans la page après envoi.

### 6.8 Pied de page
Logo, courte description, liens, coordonnées, signature, mention © 2026 Mana Prod.

### 6.9 Pages techniques
404 personnalisée, page d'erreur dans la même charte (D68), lien d'évitement « Aller au contenu » sur chaque page, `robots.txt`, `sitemap.xml`, favicon.

**Mentions légales** (`/mentions-legales`, Prompt 06), avec une section confidentialité, rédigées avec les informations connues : éditeur Mana Prod, hébergeur Vercel, base de données Supabase, données collectées par le formulaire de contact, finalité, durée de conservation, droits des personnes selon la loi sénégalaise n° 2008-12 sur la protection des données à caractère personnel. Les identifiants légaux (NINEA, RCCM, adresse du siège) sont à fournir par le client ; tant qu'ils manquent, leurs blocs sont masqués.

---

## 7. Dashboard d'administration

Accès : `/admin`, connexion par email et mot de passe (Supabase Auth). Inscriptions publiques désactivées dans Supabase Auth. Un compte administrateur pour la V1 ; d'autres administrateurs sont ajoutés par SQL (fourni dans un rapport, jamais commité).

**Mot de passe oublié** : vrai parcours de réinitialisation (demande par email sur `/admin/mot-de-passe-oublie`, puis choix d'un nouveau mot de passe sur `/admin/nouveau-mot-de-passe`). Les emails d'authentification de Supabase sont envoyés par le SMTP de Resend, et les URL de redirection de l'authentification sont réglées au Prompt 09.

Interface : barre du haut (logo, adresse de l'administrateur connecté, bouton de déconnexion, lien « Ouvrir le site »), navigation latérale (sur mobile : onglets horizontaux), contenu. Mêmes tokens que le site. Voir le prototype `manaprod-dashboard.html` pour le comportement exact. En cas d'écart, ce document prime : l'onglet « Publication » du prototype (export, import, réinitialisation) et l'état « Modifications non publiées » n'existent pas en production, puisque chaque enregistrement est publié immédiatement.

### 7.1 Showreel
- Champ lien YouTube (tous formats : watch, youtu.be, embed, shorts, live, identifiant seul) + titre du bouton.
- Aperçu intégré du lecteur. Bouton « Retirer le showreel ».
- Message d'aide : vidéo en « Non répertoriée » ou « Publique », intégration autorisée.

### 7.2 Projets
- Liste : miniature, client, titre, indicateur « à l'accueil », catégorie, année, nombre de vidéos et photos. Actions : monter, descendre, voir la page (désactivé si le projet n'est pas publié), modifier, supprimer (avec confirmation en deux temps).
- Éditeur :
  - Informations : client et titre (obligatoires tous les deux), catégorie, année, description, case « Afficher dans la sélection de l'accueil », case « Publié ».
  - Livrables : une ligne par livrable (champ multiligne), vide autorisé.
  - Miniature : téléversement, ou automatique (première vidéo YouTube, sinon première photo, sinon carte typographique, D84).
  - Vidéos YouTube : lignes avec lien, titre facultatif, aperçu, réordonner, supprimer. Validation immédiate du lien.
  - Photos : téléversement multiple, réduction automatique dans le navigateur (2400 px, WebP qualité 0,82, JPEG si le WebP n'est pas disponible, D79), largeur et hauteur enregistrées (migration 0003), texte alternatif, réordonner, supprimer. Pas de « utiliser comme miniature » (une photo supprimée casserait la miniature, D84).
  - Enregistrer, Annuler. Retour d'erreur clair.
- Le slug est généré à partir du titre et du client, modifiable, unique.

### 7.3 Clients
- Liste ordonnable : nom, logo (téléversement, PNG transparent recommandé, réduit à 520 px, WebP avec transparence ou PNG, SVG refusé), case « Afficher en blanc » pour les logos sombres, retirer le logo, supprimer. Chaque action est enregistrée aussitôt (D85).
- Un client sans logo s'affiche en texte.
- La liste des clients est indépendante des projets.

### 7.4 Équipe
- Liste ordonnable : photo (portrait, recadrée en 4:5 avec position verticale Haut, Centre ou Bas, réduite à 1000 px de large), nom, titre, présentation courte facultative (300 caractères), D86.

### 7.5 Réglages
- Phrase du hero et ligne au-dessus.
- 4 chiffres clés (valeur et libellé).
- Coordonnées : téléphone, email, localisation, promesse de réponse.
- Changement du mot de passe de l'administrateur.

### 7.6 Messages reçus (nouveau par rapport au prototype)
- Liste des demandes du formulaire de contact : date, nom, organisation, email, type, message, statut « traité ».
- Marquer comme traité, supprimer, répondre par email (lien mailto).
- Filtres Tous, À traiter, Traités ; 30 messages par page ; nombre de messages à traiter à côté de l'onglet (D88).
- Effacement automatique 24 mois après la réception, par la route `/api/keepalive` (D87).

### 7.7 Comportement général
- Toute modification publiée est visible sur le site immédiatement (revalidation du cache Next.js par étiquette à chaque enregistrement).
- Notification de succès ou d'erreur après chaque action.
- Aucun champ ne doit perdre sa saisie lors d'un réordonnancement ou d'un ajout de ligne.

---

## 8. Modèle de données (Supabase)

Le SQL exécutable complet (tables, fonctions, sécurité, stockage, données de départ) est réparti entre la migration `supabase/migrations/0001_init.sql` (structure, sécurité, stockage) et `supabase/seed/0001_seed.sql` (données de départ). Ce qui suit en est le résumé. En cas d'écart, les fichiers SQL font foi. Toute évolution passe par une nouvelle migration numérotée (`0002_...`), jamais par la modification d'une migration déjà exécutée.

```sql
-- Réglages (une seule ligne)
create table site_settings (
  id int primary key default 1 check (id = 1),
  hero_title text not null,
  hero_sub text,
  showreel_url text,
  showreel_youtube_id text,
  showreel_title text default 'Showreel',
  phone text, email text, city text,
  reply_promise text default 'Réponse sous 24h',
  stats jsonb not null default '[]',      -- [{ "value": "20+", "label": "Réalisations" }, ...]
  updated_at timestamptz default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table project_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  youtube_url text not null,
  youtube_id text not null,
  title text,
  position int not null default 0
);

create table project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  storage_path text not null,
  alt text,
  position int not null default 0
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_path text,
  logo_white boolean not null default false,
  position int not null default 0
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  photo_path text,
  position int not null default 0
);

create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  email text not null,
  project_type text,
  desired_date text,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz default now()
);

create table admin_users (user_id uuid primary key references auth.users(id) on delete cascade);
```

**Catégories autorisées** (liste fixe, modifiable plus tard) : Film institutionnel, Film corporate, Spot publicitaire, Film publicitaire, Documentaire, Reportage industriel, Couverture événement, Motion design, Photographie, Campagne multi-supports.

**Sécurité (RLS activée sur toutes les tables)**
- Lecture publique : `site_settings`, `projects` (si `published`), `project_videos`, `project_photos`, `clients`, `team_members`.
- Écriture : uniquement si l'utilisateur est dans `admin_users` (fonction `is_admin()`).
- `contact_messages` : aucune lecture ni écriture publique. L'insertion passe par la route `/api/contact` (clé service, côté serveur). Lecture et mise à jour réservées aux admins.
- La clé service n'est jamais exposée au navigateur. Elle sert uniquement à `/api/contact` et à `/api/keepalive` (effacement des messages de plus de 24 mois, D87).

**Droits d'accès (GRANT explicites)** : la migration accorde explicitement les droits, sans dépendre des réglages par défaut du projet : usage du schéma `public` pour `anon` et `authenticated` ; lecture des 6 tables de contenu pour `anon` ; lecture et écriture de ces 6 tables et de `contact_messages` pour `authenticated` ; lecture de `admin_users` pour `authenticated` ; tous les droits pour `service_role` ; exécution de `is_admin()` pour `anon` et `authenticated`. Ces droits ouvrent l'accès à l'API, la RLS reste la seule règle métier.

**Stockage** : un bucket `media` public : les fichiers sont servis par leur URL publique sans policy. Par l'API de stockage, la lecture (liste des fichiers), l'ajout, le remplacement et la suppression sont réservés aux administrateurs ; aucune policy ne permet de lister le bucket publiquement. Dossiers : `projects/{id}/`, `thumbs/`, `clients/`, `team/`. Les chemins sont stockés en base, les URL sont construites côté application.

**Index** : `projects(position)`, `project_videos(project_id, position)`, `project_photos(project_id, position)`.

---

## 9. Contenus de référence (textes validés dans le prototype)

**Hero** : ligne « Mana Prod, production audiovisuelle à Dakar ». Titre : « C'est toujours celui qui éclaire qui demeure dans l'obscurité. »

**Accueil, bloc Le studio** : « Agence de production audiovisuelle à Dakar, portée par Amath NDIAYE, vidéaste et monteur professionnel. Nous réalisons des films institutionnels, des spots, des documentaires et des couvertures d'événements, de la captation à la livraison finale. »

**Studio** : « Une signature visuelle forte. » Puis : « MANA PROD est une agence de production audiovisuelle basée à Dakar, portée par Amath NDIAYE, vidéaste et monteur professionnel. » Puis : « Nous créons des contenus visuels qui marquent, émeuvent et restent, pour des institutions internationales comme pour les marques les plus ambitieuses. De la captation à la livraison finale, nous maîtrisons toute la chaîne de production avec une exigence créative totale et des standards internationaux. »

**Chiffres (à confirmer par le client)** : 20+ Réalisations, 8+ Clients majeurs, 4K Standard de production, 24h Délai de réponse (24h retenu par défaut ; la plaquette indique 48h).

**Français et wolof** : « Des contenus pensés pour le public sénégalais et ouest-africain. Nous travaillons en français et en wolof, avec la qualité des grandes agences, livrée depuis Dakar. »

**Services**
1. Production vidéo : Films institutionnels, corporate, publicités, documentaires.
2. Motion design : Animation 2D, génériques, spots didactiques.
3. Photographie : Reportages, portraits corporate, photographie produit HD.
4. Communication digitale : Stratégie de contenu, réseaux sociaux, campagnes.
5. Captation et événementiel : Multi-caméras, couverture live, montage express.
6. Drone et direction artistique : Prises de vue aériennes, identité de campagne.

**Méthode** : Brief (objectif, cible et ton, un seul interlocuteur), Tournage (captation 4K, multi-caméras si besoin, lumière et son maîtrisés), Post-production (montage, étalonnage, motion design, validation à chaque étape), Livraison (livrables aux formats demandés, dans les délais convenus).

**Pourquoi Mana Prod** : Qualité internationale depuis Dakar ; Un interlocuteur unique ; Réactivité et délais tenus ; Toute la chaîne maîtrisée.

**Équipement** : Caméra Sony FX3 (Full Frame 4K cinématique) ; Optiques série G Master (16-35, 24-70, 85 mm) ; Stabilisation DJI Ronin RS ; Aérien drone DJI ; Éclairage Aputure 300 et 600, Amaran F22 ; Son micros directionnels et cravates sans fil ; Post-production DaVinci Resolve, Premiere Pro, After Effects ; Communication casque Hollyland.

**Équipe de départ** : Amath NDIAYE (vidéaste et monteur professionnel), Babou (cadreur), Sidy SARR (motion designer). Photos fournies.

**Clients de départ** : UNICEF, CBAO, SEN'EAU, BIS, Kayel Café, Forhope, Réalités SN, Port de Dakar.

**Projets de départ** (sans vidéo ni photo, à compléter par le client)

| Client | Titre | Catégorie | À l'accueil |
|---|---|---|---|
| UNICEF | Staff Team Awards | Film institutionnel | oui |
| CBAO | Groupe Attijariwafa | Film corporate | oui |
| SEN'EAU | 5e anniversaire | Film institutionnel | oui |
| BIS | Banque Islamique | Spot publicitaire | oui |
| Kayel Café | Lancement produit | Film publicitaire | oui |
| Forhope | Inauguration de « la maison des parents » | Couverture événement | oui |
| Réalités SN | Réalités Sénégal | Documentaire | non |
| Port de Dakar | Reportage maritime | Reportage industriel | non |

Les descriptions et livrables sont à rédiger par le client. Ne rien inventer : les blocs vides sont masqués. L'année 2026 est enregistrée pour les 8 projets, à confirmer par le client.

**Textes du prototype** : quand le prototype donne une version plus détaillée qu'une liste ci-dessus (équipement, « Pourquoi Mana Prod », libellé « Votre projet » du formulaire), c'est le texte du prototype qui fait foi.

---

## 10. Règles YouTube

- **Extraction de l'identifiant** (11 caractères) depuis : `youtu.be/ID`, `youtube.com/watch?v=ID`, `/embed/ID`, `/shorts/ID`, `/live/ID`, `/v/ID`, ou l'identifiant seul. Validation à la saisie, refus avec message clair sinon.
- **Miniatures** : `https://i.ytimg.com/vi/ID/maxresdefault.jpg`, repli automatique sur `hqdefault.jpg` si l'image n'existe pas.
- **Lecteur** : domaine `youtube-nocookie.com`, paramètres `rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`.
- **Hero** : en plus `autoplay=1&mute=1&controls=0&loop=1&playlist=ID&disablekb=1&fs=0`, iframe agrandie pour couvrir tout le cadre (16:9 en cover), `pointer-events: none`.
- **Façade** : sur les fiches projet, afficher la miniature et un bouton play, ne charger l'iframe qu'au clic (performance).
- **Aperçu au survol** : iframe muette en boucle ajoutée par-dessus la miniature, apparition en fondu quand elle est chargée, retirée quand la souris quitte la vignette. Désactivé sur écrans tactiles et si le mouvement réduit est demandé.
- Une vidéo privée ne s'affiche pas : le dashboard l'indique dans l'aide.

---

## 11. Performance, SEO, accessibilité

**Performance** : LCP inférieur à 2,5 s sur mobile 4G, CLS inférieur à 0,1, scores Lighthouse supérieurs à 90 (performance, accessibilité, bonnes pratiques, SEO). Images servies via `next/image` (AVIF/WebP, tailles responsives), chargement différé hors écran, iframes YouTube en façade, police auto-hébergée avec `next/font`.

**SEO** : titre et description par page, Open Graph et Twitter cards, image de partage par projet (miniature), `sitemap.xml` dynamique (projets publiés), `robots.txt` (le dashboard est exclu et en `noindex` ; jusqu'à la mise en ligne, tout le site est en `noindex`), données structurées Organization et VideoObject sur les fiches projet.

**Accessibilité (WCAG AA)** : contrastes vérifiés, navigation clavier complète, focus visible (contour turquoise), modales avec piégeage du focus et fermeture par Échap, textes alternatifs, libellés de formulaires, `aria-live` pour les erreurs, respect de `prefers-reduced-motion`, cibles tactiles d'au moins 44 px.

**Responsive** : points de rupture principaux à 560, 700, 820 et 1000 px. Aucun défilement horizontal de 390 px à 1920 px.

---

## 12. Critères d'acceptation

Le projet est livré quand :
1. Les 6 pages publiques correspondent aux prototypes (structure, textes, interactions) et passent les tests mobile et bureau sans erreur console.
2. Un administrateur peut, sans aucune aide technique : ajouter et retirer le showreel, créer, modifier, réordonner et supprimer un projet avec plusieurs vidéos YouTube, photos, miniature et livrables, gérer les clients (avec logos) et l'équipe, modifier les réglages, lire les messages.
3. Toute modification apparaît sur le site public en moins de 10 secondes.
4. Le formulaire de contact enregistre le message, envoie l'email de notification et l'accusé de réception, résiste au spam de base.
5. Un visiteur non connecté ne peut ni lire ni écrire dans les tables protégées (test RLS), et `/admin` est inaccessible sans connexion.
6. Scores Lighthouse de la section 11 atteints sur l'accueil et une fiche projet.
7. Lint, `tsc --noEmit`, build et tests passent sans erreur ni avertissement bloquant, y compris sans variables d'environnement ; aucun placeholder, aucun emoji, aucun tiret long dans le code, les textes et les commentaires.
8. Le site est en ligne sur manaprod.com avec HTTPS, et le cron anti-pause fonctionne.

---

## 13. Feuille de route des prompts

Un prompt à la fois : le suivant n'est rédigé qu'après lecture et validation du rapport du précédent. Claude Code reprend cette feuille de route dans `PROJECT_STATE.md` au Prompt 00 et peut proposer de l'ajuster dans son rapport, avec ses raisons. La branche est `main` jusqu'à la mise en ligne, puis `feat/...` ou `fix/...`.

| Prompt | Lot | Contenu | Prérequis côté Ziza |
|---|---|---|---|
| 00 | Initialisation | Organisation du dépôt, lecture du cahier et des prototypes, création de `CLAUDE.md`, `PROJECT_STATE.md`, `decisions.md`, `.gitignore`, `.env.example`. Aucun code applicatif | Dépôt GitHub créé avec ce kit |
| 01 | Socle | Intégration des arbitrages du Prompt 00, correction de `0001_init.sql` avant exécution (GRANT, lecture du bucket), projet Next.js (App Router, TypeScript strict, lint, Tailwind), tokens de la charte (section 4.2), Schibsted Grotesk via `next/font`, clients Supabase serveur et navigateur sans crash si variables absentes, favicon et icônes, photos de l'équipe copiées dans `public/team/`, site en `noindex`, page d'accueil minimale déployée. Aucune fonctionnalité métier | Projet Vercel créé et relié au dépôt, `NEXT_PUBLIC_SITE_URL` saisie |
| 02 | Interface | Fondations de l'interface sans base de données : composants Logo et LogoEmpile, en-tête et menu mobile, pied de page, bouton-lien, composants de mouvement (apparition, mots, transition entre pages), page 404, utilitaires YouTube (section 10) avec tests | |
| 03 | Données | Types `src/types/database.ts` écrits à la main d'après `0001_init.sql`, couche de lecture des données avec étiquettes de cache, route `/api/keepalive` et cron Vercel tous les 6 jours, région des fonctions Vercel à Paris (`cdg1`) dans `vercel.json` | Projet Supabase créé en région Paris (`eu-west-3`), inscriptions publiques désactivées, `0001_init.sql` puis `0001_seed.sql` exécutés et confirmés, variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `CRON_SECRET` saisies |
| 04 | Accueil | Page d'accueil complète (section 6.2) | |
| 05 | Réalisations et fiche projet | Liste avec filtres, grille, aperçu au survol ; fiche projet (vidéos, photos, visionneuse, livrables, projet suivant) | |
| 06 | Services, Le studio et mentions légales | Pages Services et Le studio (compteurs, équipe, équipement), page `/mentions-legales` avec section confidentialité | |
| 07 | Contact | Formulaire, validation serveur, pot de miel, migration `0002_` de limitation des envois (IP hachée, purge), enregistrement en base, emails avec Resend (notification et accusé de réception) | Accès au DNS de manaprod.com (vérification du domaine dans Resend, sans toucher aux enregistrements MX), compte Resend, domaine vérifié, variables `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| 08 | Audit 1 | Contrôle complet des prompts 01 à 07 : sécurité, mobile 360 px, accessibilité, cohérence avec les prototypes | |
| 09 | Authentification | Connexion, mot de passe oublié (demande par email, nouveau mot de passe), protection de `/admin`, coquille du dashboard (adresse de l'admin connecté, déconnexion), onglets Showreel et Réglages, revalidation du cache après chaque enregistrement | Compte administrateur créé dans Supabase Auth ; SMTP de Resend configuré dans Supabase Auth ; URL de redirection de l'authentification réglées ; SQL de déclaration de l'administrateur fourni dans le rapport (il contient un identifiant de compte, il ne va pas dans le dépôt) |
| 10 | Admin projets | Onglet Projets complet : vidéos, téléversement des photos et de la miniature, livrables, ordre, publication | |
| 11 | Admin clients, équipe et messages | Onglets Clients (avec logos), Équipe, Messages | |
| 12 | Audit 2 | Contrôle complet des prompts 09 à 11, en particulier RLS et stockage | |
| 13 | Qualité | SEO (métadonnées, sitemap, Open Graph, données structurées), accessibilité AA, performance (section 11) | |
| 14 | Mise en ligne | Vérifications de la section 12 de la méthode et de la section 12 de ce cahier, retrait du `noindex` global, guide pas à pas pour pointer manaprod.com vers Vercel sans modifier les enregistrements MX | Accès au DNS de manaprod.com |
---

## 14. Méthode de travail avec Claude Code

La méthode complète est dans `docs/methode-de-developpement.md` : rôles, protocole en 8 étapes de chaque prompt, format des prompts et des rapports, migrations, branches, règles absolues et leçons apprises. Elle s'applique telle quelle. Ce qui suit précise seulement ce qui est propre à Mana Prod.

### 14.1 Base de données
- Migration fournie : `supabase/migrations/0001_init.sql`. Données de départ fournies : `supabase/seed/0001_seed.sql`, à exécuter après la migration. Les deux sont inscrites « Non exécutée » au registre des migrations de `PROJECT_STATE.md` jusqu'à confirmation de Ziza.
- Les migrations suivantes sont numérotées à partir de `0002_`. Les types de `src/types/database.ts` sont mis à jour dans le même prompt que la migration.
- Écriture réservée aux administrateurs (fonction `is_admin()`), messages de contact insérés côté serveur avec la clé service, droits d'accès accordés par GRANT explicites, bucket `media` servi publiquement par URL, lecture par l'API réservée aux administrateurs, SVG exclus.

### 14.2 Règles de code et de contenu
- TypeScript strict, composants serveur par défaut, actions serveur pour le dashboard, validation avec zod.
- Framer Motion pour toutes les animations, respect de `prefers-reduced-motion`.
- Icônes lucide-react au trait, aucun emoji. Aucun tiret long ni tiret moyen, dans le code, les textes, les commentaires et les commits.
- Textes en français, accents corrects, apostrophe typographique (’) dans les textes affichés.
- Zéro placeholder, zéro `TODO`, zéro contenu client inventé : uniquement la section 9 et la base de données. La règle vise les contenus factices : l'attribut HTML `placeholder` (aide de saisie dans un champ) est autorisé.
- Le logo n'est jamais déformé : on fixe sa largeur ou sa hauteur, jamais les deux.
- Mobile-first : vérification à 360 px, cibles tactiles de 44 px minimum, fenêtres modales limitées à 85 % de la hauteur d'écran.
- Pour tout travail d'interface, Claude Code ouvre le prototype correspondant dans `docs/reference/` et s'y conforme.

### 14.3 Vérifications
- Avant chaque commit : lint, `tsc --noEmit`, build, et tests unitaires dès qu'ils existent (Vitest pour les fonctions pures, à commencer par les utilitaires YouTube).
- Le test fonctionnel se fait sur l'URL Vercel : chaque rapport indique quoi vérifier, où, et le résultat attendu.

### 14.4 Blocages
- Blocage externe (clé manquante, action dans Supabase, Vercel, Resend ou le DNS) : aucune valeur inventée, code complet qui fonctionnera dès que l'élément sera fourni, action pas à pas dans « Actions pour Ziza ».
- Jamais de commande à exécuter sur la machine de Ziza.

---

## 15. Points ouverts à confirmer avec le client

1. **Logo** : valider le logo Éclipse avec Amath (version empilée proposée comme principale).
2. **Typographie** : Schibsted Grotesk proposée pour tout le site ; le logo est dessiné avec, ce qui assure la cohérence.
3. **Showreel** : lien YouTube du showreel de l'agence.
4. **Contenus des projets** : liens YouTube, miniatures, photos, descriptions et livrables des 8 projets.
5. **Chiffres clés** : confirmer 20+ réalisations, 8+ clients majeurs.
6. **Équipe** : nom complet de Babou, présentations courtes éventuelles, autres membres.
7. **Équipement** : confirmer la liste.
8. **Email** : fournisseur d'envoi (Resend retenu), adresse d'expédition, adresse de réception des demandes.
9. **Domaine** : accès au DNS de manaprod.com (actuellement chez WordPress.com) pour le pointer vers Vercel (voir aussi le point 16).
10. **Mentions légales** : contenu à fournir.
11. **Langues** : la version anglaise est-elle souhaitée en V2 ?
12. **Comptes admin** : adresse email de l'administrateur principal.
13. **Délai de réponse** : 24h retenu par défaut (la plaquette indique 48h).
14. **Années des projets** : 2026 enregistré pour les 8 projets, à confirmer.
15. **Identifiants légaux** pour les mentions légales : NINEA, RCCM, adresse du siège.
16. **Accès au DNS** de manaprod.com : demandé dès maintenant, nécessaire avant le Prompt 07 (vérification du domaine d'expédition dans Resend). Les enregistrements MX existants (boîte amathndiaye@manaprod.com) ne doivent jamais être modifiés.
17. **Logos des clients** : PNG à fond transparent de préférence (les SVG sont refusés par le stockage).

---

## 16. Récapitulatif des différences prototype et production

| Sujet | Prototype | Production |
|---|---|---|
| Données | Navigateur (IndexedDB), fichier `manaprod-data.js` à publier à la main | Supabase, publication immédiate |
| Authentification | Aucune (fichier privé) | Supabase Auth, routes protégées |
| Photos | Intégrées en base64 dans le fichier de données | Supabase Storage, `next/image` |
| Formulaire de contact | Ouvre l'application email | Enregistrement en base, email de notification et accusé de réception |
| Messages reçus | Absents | Onglet dédié du dashboard |
| Animations | CSS et JavaScript | Framer Motion |
| Multi-utilisateurs | Non | Oui |
