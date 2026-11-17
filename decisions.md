# Journal des décisions : Mana Prod

Chaque entrée : date, décision, raison, alternative écartée. Une décision par entrée. Les décisions ci-dessous ont été reprises au Prompt 00 depuis le cahier des charges (version 1.3), les prototypes et le dossier du logo.

---

## D01 : Logo Éclipse

- **Date** : 2026-11-16 (Prompt 00, repris du cahier v1.3 du 15 novembre 2026)
- **Décision** : le logo du site est le logo Éclipse (disque d'ombre cerné d'un anneau turquoise `#2EC4CF`, point brillant). Logo horizontal dans l'en-tête, le pied de page et le dashboard, sous forme de composant React `Logo` avec les textes en `currentColor`. Symbole seul en blanc pour le filigrane du hero de repli. Favicon et icônes issus de `docs/reference/logo/icones/`.
- **Raison** : il traduit la signature de l'agence (« C'est toujours celui qui éclaire qui demeure dans l'obscurité. »), il est livré complet (SVG, PNG, icônes, règles d'usage) et il est déjà intégré dans les deux prototypes.
- **Alternative écartée** : conserver l'ancienne identité ou utiliser une image PNG du logo dans l'en-tête (moins nette, non adaptable à la couleur du texte).
- **Statut** : validation finale par Amath attendue (cahier, section 15, point 1).

## D02 : Police Schibsted Grotesk

- **Date** : 2026-11-16 (Prompt 00, repris du cahier v1.3)
- **Décision** : Schibsted Grotesk (graisses 400 à 900) pour tout le site et le dashboard, auto-hébergée via `next/font` (pas d'appel à Google Fonts depuis le navigateur du visiteur).
- **Raison** : le nom MANA PROD du logo est vectorisé à partir de cette police (MANA en 800, PROD en 500), ce qui garantit la cohérence ; elle est sous licence SIL Open Font License ; elle évite l'effet « typographie générique ». L'auto-hébergement améliore la performance et évite une requête vers un service tiers.
- **Alternative écartée** : Fraunces et Jost, ou Archivo (conventions habituelles de Ziza). Ne pas changer sans validation.
- **Statut** : validation finale par Amath attendue (cahier, section 15, point 2).

## D03 : Resend pour les emails

- **Date** : 2026-11-16 (Prompt 00, repris du cahier v1.3)
- **Décision** : les emails transactionnels du formulaire de contact (notification à l'agence et accusé de réception au visiteur) sont envoyés avec Resend, depuis une adresse d'un domaine vérifié dans Resend (`CONTACT_FROM_EMAIL`).
- **Raison** : API simple, intégration directe avec Next.js sur Vercel, offre gratuite suffisante pour le volume d'un site vitrine, vérification de domaine (SPF, DKIM) qui améliore la délivrabilité.
- **Alternative écartée** : le comportement du prototype (lien `mailto:` qui ouvre l'application email du visiteur), sans enregistrement ni accusé de réception ; ou un serveur SMTP classique (plus de configuration, délivrabilité moins maîtrisée).
- **Statut** : fournisseur à confirmer par le client (cahier, section 15, point 8).

## D04 : YouTube en mode nocookie

- **Date** : 2026-11-16 (Prompt 00, repris du cahier v1.3, section 10)
- **Décision** : toutes les vidéos sont intégrées via le domaine `youtube-nocookie.com`, avec les paramètres `rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`. Les vidéos des fiches projet sont en façade (miniature `i.ytimg.com` et bouton play, iframe chargée au clic).
- **Raison** : limite le dépôt de cookies de suivi avant interaction, respecte mieux la vie privée des visiteurs, et la façade préserve les performances.
- **Alternative écartée** : domaine `youtube.com` standard, ou hébergement des vidéos (exclu de la V1).

## D05 : Bucket media public, sans SVG

- **Date** : 2026-11-16 (Prompt 00, repris de `0001_init.sql` et du cahier, section 14.1)
- **Décision** : un seul bucket Supabase `media`, en lecture publique, écriture réservée aux administrateurs (`is_admin()`), types acceptés JPEG, PNG, WebP et AVIF, 10 Mo maximum par fichier. Les SVG sont refusés.
- **Raison** : toutes les images du site sont publiques par nature (projets, logos clients, équipe), ce qui évite les URL signées. Un SVG peut contenir du script : l'exclure supprime un risque d'injection.
- **Alternative écartée** : bucket privé avec URL signées (complexité inutile pour du contenu public) ; accepter les SVG pour les logos clients (risque de sécurité).

## D06 : Photos de l'équipe de départ servies depuis public/team

- **Date** : 2026-11-16 (Prompt 00, repris du cahier, section 3, et de `0001_seed.sql`)
- **Décision** : les trois photos fournies (`docs/reference/team/*.jpg`, 1200 x 1500, ratio 4:5) sont copiées dans `public/team/` au Prompt 01. En base, un chemin qui commence par `/` désigne un fichier statique du site ; tout autre chemin désigne un fichier du bucket `media`. Les nouvelles photos téléversées depuis le dashboard vont dans `media/team/`.
- **Raison** : les données de départ doivent fonctionner sans téléversement manuel dans Supabase Storage, et un fichier SQL ne peut pas déposer d'image dans un bucket.
- **Alternative écartée** : demander à Ziza de téléverser les photos à la main dans le bucket (étape manuelle de plus, source d'erreur) ; intégrer les photos en base64 comme dans le prototype (base alourdie).

## D07 : Cron anti-pause Supabase tous les 6 jours

- **Date** : 2026-11-16 (Prompt 00, repris du cahier, section 3)
- **Décision** : une route `/api/keepalive`, protégée par `CRON_SECRET`, fait une requête simple sur la base. Elle est appelée tous les 6 jours par Vercel Cron (déclaré dans `vercel.json`).
- **Raison** : un projet Supabase gratuit est mis en pause après 7 jours sans activité ; un appel tous les 6 jours garde une marge. Vercel Cron est inclus dans l'hébergement déjà retenu et envoie automatiquement le secret dans l'en-tête `Authorization`.
- **Alternative écartée** : GitHub Action planifiée (un second outil à configurer, avec un secret à saisir dans GitHub) ; passage à une offre Supabase payante.

## D08 : Keepalive et cron avancés au Prompt 02

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : La route `/api/keepalive` et le cron Vercel tous les 6 jours sont créés au Prompt 02 (et non au Prompt 12). `CRON_SECRET` est nécessaire à partir du Prompt 02.
- **Raison** : Un projet Supabase gratuit est mis en pause après 7 jours sans activité ; entre les Prompts 02 et 12, plusieurs semaines peuvent s'écouler.
- **Alternative écartée** : Garder le cron au Prompt 12 (risque de pause de la base pendant le développement).

## D09 : Accès au DNS requis avant le Prompt 06, MX intouchables

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : L'accès au DNS de manaprod.com est requis avant le Prompt 06. Les enregistrements MX existants ne sont jamais modifiés.
- **Raison** : Resend exige des enregistrements DNS (SPF, DKIM) pour vérifier le domaine d'expédition ; sans eux, aucun accusé de réception ne peut partir vers les visiteurs. Les MX servent la boîte amathndiaye@manaprod.com.
- **Alternative écartée** : Attendre le Prompt 13 pour l'accès DNS (accusé de réception impossible jusque-là) ; envoyer depuis une adresse de test Resend.

## D10 : Limitation des envois du formulaire en base

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Migration `0002_` au Prompt 06 : table des envois récents avec une empreinte (hachage) de l'IP, jamais l'IP en clair, purge des lignes anciennes, aucun service externe.
- **Raison** : Sur Vercel, chaque requête peut s'exécuter sur une instance différente : une limite gardée en mémoire n'est pas fiable. Le hachage évite de stocker une donnée personnelle en clair.
- **Alternative écartée** : Limite en mémoire (inefficace) ; service externe de type Redis (un compte et un secret de plus).

## D11 : Page mentions légales au Prompt 05

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Page `/mentions-legales` avec section confidentialité au Prompt 05 : éditeur Mana Prod, hébergeur Vercel, base Supabase, données collectées par le formulaire, finalité, durée de conservation, droits des personnes selon la loi sénégalaise n° 2008-12. Les blocs NINEA, RCCM et adresse du siège sont masqués tant que le client ne les a pas fournis.
- **Raison** : Page exigée par le cahier (6.9) et la méthode (section 12), et le formulaire collecte des données personnelles.
- **Alternative écartée** : Reporter la page à la mise en ligne ; publier des identifiants légaux inventés.

## D12 : Inscriptions publiques désactivées dans Supabase Auth

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Les inscriptions publiques sont désactivées dès la création du projet Supabase (action Ziza). Les URL de redirection de l'authentification sont réglées au Prompt 08.
- **Raison** : Avec les inscriptions ouvertes, n'importe qui pourrait créer un compte avec la clé publique ; la RLS le bloquerait, mais aucun compte inutile ne doit exister.
- **Alternative écartée** : Laisser les inscriptions ouvertes et compter sur la seule RLS.

## D13 : Clé service nécessaire seulement au Prompt 06

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : `SUPABASE_SERVICE_ROLE_KEY` n'est nécessaire qu'à partir du Prompt 06. Le client Supabase « service » n'est créé qu'au Prompt 06.
- **Raison** : Son seul usage est l'insertion des messages de contact ; ne pas la créer plus tôt réduit la surface d'exposition.
- **Alternative écartée** : Créer le client service dès le Prompt 01 (code non utilisé, contraire à la règle 3).

## D14 : Filigrane du hero de repli à 6 %

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le symbole en filigrane du hero de repli a une opacité de 6 %.
- **Raison** : Valeur du prototype (0,06) et de la section 4.1 du cahier ; le prototype prime pour le visuel.
- **Alternative écartée** : 5 % (section 6.2 du cahier v1.3).

## D15 : Couleur du mot PROD

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Dans le logo sur fond sombre, PROD est en `#8FA3A8` (charte du logo) et MANA prend la couleur du texte.
- **Raison** : C'est la couleur des fichiers SVG officiels et de `LISEZ-MOI.md`.
- **Alternative écartée** : Opacité de 60 % du blanc, comme dans la constante `LOGO` du prototype.

## D16 : Délai de réponse de 24h par défaut

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le chiffre « Délai de réponse » vaut 24h par défaut, à confirmer par le client.
- **Raison** : Valeur du cahier, du prototype et de la base ; elle est modifiable dans les réglages du dashboard.
- **Alternative écartée** : 48h « Réactivité », valeur de la plaquette.

## D17 : Titre du projet Port de Dakar

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le projet Port de Dakar s'intitule « Reportage maritime ».
- **Raison** : Titre du cahier, déjà présent dans les données de départ.
- **Alternative écartée** : « Maritime », titre de la plaquette.

## D18 : Textes détaillés du prototype

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Pour l'équipement, « Pourquoi Mana Prod » et le libellé « Votre projet » du formulaire, le texte du prototype fait foi.
- **Raison** : Règle d'or : le prototype prime pour les textes, et ses versions sont plus complètes.
- **Alternative écartée** : Les listes résumées de la section 9 du cahier.

## D19 : Années des projets

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : L'année 2026 est conservée dans la base pour les 8 projets, à confirmer par le client.
- **Raison** : Valeur du prototype et de la plaquette ; modifiable dans le dashboard.
- **Alternative écartée** : Laisser l'année vide (information visible dans la méta des fiches projet).

## D20 : Aucun lien vers /admin sur le site public

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le site public ne contient aucun lien vers `/admin` ; l'accès se fait par l'URL.
- **Raison** : Ne pas signaler l'interface d'administration aux visiteurs ; la formulation du cahier v1.3 (« lien discret non affiché ») était contradictoire.
- **Alternative écartée** : Un lien discret dans le pied de page.

## D21 : Dashboard : le cahier prime sur le prototype

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Pas d'onglet Publication (export, import, réinitialisation). La barre du haut affiche l'adresse de l'administrateur connecté et un bouton de déconnexion, à la place de l'état « Modifications non publiées ».
- **Raison** : En production, chaque enregistrement est publié immédiatement : l'onglet Publication et l'état de publication n'ont plus d'objet.
- **Alternative écartée** : Reprendre l'onglet Publication du prototype.

## D22 : Client et titre obligatoires

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Un projet exige un client et un titre (tous les deux).
- **Raison** : La base les déclare `not null` et le slug est construit à partir des deux.
- **Alternative écartée** : Le comportement du prototype (client ou titre suffit).

## D23 : Sélection de l'accueil

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : La sélection affiche les projets publiés marqués « à la une » ; s'il n'y en a aucun, les 6 premiers projets publiés selon leur ordre.
- **Raison** : Reprend le repli du prototype en le limitant aux projets publiés, pour que la section ne soit jamais vide sans raison.
- **Alternative écartée** : Masquer la section quand aucun projet n'est à la une.

## D24 : Attribut placeholder autorisé

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : L'attribut HTML `placeholder` (aide de saisie) est autorisé ; la règle « aucun placeholder » vise les contenus factices.
- **Raison** : Les aides de saisie du prototype améliorent les formulaires et ne simulent aucun contenu.
- **Alternative écartée** : Supprimer toutes les aides de saisie.

## D25 : Mot de passe oublié

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Vrai parcours de réinitialisation au Prompt 08 : demande par email, puis page de nouveau mot de passe. Les emails d'authentification Supabase passent par le SMTP de Resend (action Ziza au Prompt 08).
- **Raison** : Le client doit pouvoir retrouver l'accès seul ; le service d'email intégré de Supabase est très limité.
- **Alternative écartée** : Réinitialisation manuelle par Ziza, qui rend le client dépendant.

## D26 : Ajout d'autres administrateurs par SQL

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : En V1, un administrateur supplémentaire est ajouté par SQL, fourni dans un rapport et jamais commité.
- **Raison** : Besoin rare, et une interface de gestion des comptes ajouterait une surface d'attaque.
- **Alternative écartée** : Écran de gestion des administrateurs dans le dashboard.

## D27 : Bouton « Voir la page » d'un projet non publié

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le bouton « Voir la page » est désactivé pour un projet non publié.
- **Raison** : La page publique d'un projet non publié renvoie une 404 (RLS) : le lien mènerait à une erreur.
- **Alternative écartée** : Page d'aperçu réservée aux administrateurs.

## D28 : Accusé de réception sans le message du visiteur

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : L'accusé de réception envoyé au visiteur ne reprend jamais le contenu de son message.
- **Raison** : Sinon, n'importe qui pourrait envoyer un texte de son choix à une adresse tierce via le formulaire (relais de spam).
- **Alternative écartée** : Copie complète du message dans l'accusé de réception.

## D29 : Hero vidéo et LCP

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Le texte du hero est rendu côté serveur ; l'iframe YouTube n'est chargée qu'ensuite.
- **Raison** : Préserver l'objectif LCP inférieur à 2,5 s sur mobile 4G.
- **Alternative écartée** : Iframe chargée immédiatement avec la page.

## D30 : Correction de 0001_init.sql avant exécution

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : `0001_init.sql`, jamais exécuté, est corrigé directement : GRANT explicites (anon, authenticated, service_role, exécution de `is_admin()`) et lecture du bucket `media` par l'API réservée aux administrateurs.
- **Raison** : Certains projets Supabase récents n'exposent plus automatiquement les nouvelles tables à l'API ; la policy de lecture publique ne servait qu'à lister tout le bucket, les fichiers d'un bucket public restant servis par leur URL.
- **Alternative écartée** : Laisser le fichier tel quel et corriger plus tard par une migration `0002_`.

## D31 : Site entier en noindex jusqu'à la mise en ligne

- **Date** : 2026-11-16 (Prompt 01, arbitrage du rapport du Prompt 00)
- **Décision** : Tout le site est en `noindex, nofollow` jusqu'au Prompt 13, qui retire cette règle.
- **Raison** : L'URL Vercel est publique : il ne faut pas qu'une version en construction soit indexée.
- **Alternative écartée** : Laisser le site indexable pendant le développement.

## D32 : Versions du socle

- **Date** : 2026-11-16 (Prompt 01)
- **Décision** : Next.js 16.4.6, React 19.3.0, TypeScript 5.9.3, Tailwind CSS 4.3.5 (avec `@tailwindcss/turbopack` 4.3.5), ESLint 9.39.5 et `eslint-config-next` 16.4.6, `@supabase/ssr` 0.12.7, `@supabase/supabase-js` 2.119.0, `server-only` 0.0.1. Versions exactes dans `package.json` (sans `^`) et verrouillées par `package-lock.json`.
- **Raison** : Dernières versions stables au 16 novembre 2026 ; des versions exactes rendent chaque déploiement Vercel reproductible.
- **Alternative écartée** : Plages de versions (`^`), qui peuvent changer d'un déploiement à l'autre.

## D33 : Configuration par défaut de create-next-app 16.4.6

- **Date** : 2026-11-16 (Prompt 01)
- **Décision** : Le projet reprend la configuration générée par `create-next-app` 16.4.6 : Cache Components et Partial Prefetching activés, Tailwind chargé par Turbopack. Le fichier `AGENTS.md` généré n'est pas conservé.
- **Raison** : Configuration recommandée de la version ; Cache Components fournit la mise en cache par étiquette utile à la revalidation (cahier 7.7). `AGENTS.md` contient des tirets longs (interdits) et fait doublon avec `CLAUDE.md`.
- **Alternative écartée** : Désactiver Cache Components (ancien modèle de cache) ; conserver `AGENTS.md`.

## D34 : Paquet server-only

- **Date** : 2026-11-16 (Prompt 01)
- **Décision** : Ajout de `server-only` : `src/lib/supabase/server.ts` l'importe pour que tout import depuis un composant client échoue au build.
- **Raison** : Règle de sécurité de `CLAUDE.md` (section 11) ; paquet recommandé par la documentation Next.js, sans dépendance.
- **Alternative écartée** : Se reposer sur la seule vigilance lors de la relecture.

## D35 : Noms des routes de réinitialisation du mot de passe

- **Date** : 2026-11-16 (Prompt 01)
- **Décision** : `/admin/mot-de-passe-oublie` (demande) et `/admin/nouveau-mot-de-passe` (choix du nouveau mot de passe), inscrites dans le cahier v1.4, section 5.
- **Raison** : Routes en français, cohérentes avec le reste du site.
- **Alternative écartée** : Routes en anglais (`/admin/forgot-password`, `/admin/reset-password`).

## D36 : Renumérotation de la feuille de route

- **Date** : 2026-11-16 (Prompt 02)
- **Décision** : L'ancien Prompt 02 « Fondations » est scindé en deux : Prompt 02 « Interface » (sans base de données) et Prompt 03 « Données » (types, couche de lecture, keepalive, cron, région Vercel). Tous les prompts suivants sont décalés d'un numéro. Correspondance ancien numéro, nouveau numéro :

  | Ancien | Nouveau | Lot |
  |---|---|---|
  | 00 | 00 | Initialisation |
  | 01 | 01 | Socle |
  | 02 | 02 et 03 | Interface, puis Données |
  | 03 | 04 | Accueil |
  | 04 | 05 | Réalisations et fiche projet |
  | 05 | 06 | Services, Le studio et mentions légales |
  | 06 | 07 | Contact |
  | 07 | 08 | Audit 1 |
  | 08 | 09 | Authentification |
  | 09 | 10 | Admin projets |
  | 10 | 11 | Admin clients, équipe et messages |
  | 11 | 12 | Audit 2 |
  | 12 | 13 | Qualité |
  | 13 | 14 | Mise en ligne |

  Les décisions D08 à D35 ne sont pas réécrites : les numéros de prompt qu'elles citent suivent l'ancienne numérotation et se lisent avec cette table.
- **Raison** : Le projet Supabase n'est pas encore créé : la partie qui n'a pas besoin de la base peut avancer sans attendre.
- **Alternative écartée** : Attendre la création de Supabase avant tout nouveau prompt (projet bloqué).

## D37 : Région Paris pour Supabase et les fonctions Vercel

- **Date** : 2026-11-16 (Prompt 02)
- **Décision** : Le projet Supabase est créé en région Paris (`eu-west-3`) et les fonctions Vercel s'exécutent en région Paris (`cdg1`, déclarée dans `vercel.json` au Prompt 03).
- **Raison** : Paris est la région la plus proche de Dakar parmi celles proposées ; placer la base et les fonctions dans la même région limite la latence entre Vercel et Supabase.
- **Alternative écartée** : Région par défaut de Vercel (`iad1`, États-Unis), qui ajouterait un aller-retour transatlantique à chaque requête vers la base.

## D38 : Bibliothèques d'interface et de test

- **Date** : 2026-11-16 (Prompt 02)
- **Décision** : `motion` 14.14.0 (import depuis `motion/react`), `lucide-react` 1.73.0, `vitest` 5.1.0. `@types/node` passe de 20.19.43 à 22.20.5, version exigée par Vitest 5 et alignée sur Node 22 de Vercel. Versions exactes dans `package.json`.
- **Raison** : `motion` est le nouveau nom de Framer Motion, publié par la même équipe, avec la même API : c'est le paquet maintenu, `framer-motion` n'est plus qu'un alias historique.
- **Alternative écartée** : `framer-motion` (nom historique, même code, mises à jour qui suivent `motion`).

## D39 : Année du pied de page avec Cache Components

- **Date** : 2026-11-16 (Prompt 02)
- **Décision** : L'année de la mention © est calculée dans un composant serveur `"use cache"` avec `cacheLife("days")`. La page reste prérendue et statique, et elle est régénérée au plus tard une fois par jour.
- **Raison** : Avec Cache Components, un appel direct à `new Date()` pendant le prérendu fait échouer le build. Le cache d'un jour garde la page statique et met l'année à jour au plus tard le 2 janvier.
- **Alternative écartée** : Année calculée au build (fausse après le 1er janvier jusqu'au déploiement suivant) ; `connection()` dans une zone `Suspense` (pied de page rendu à chaque requête) ; calcul dans le navigateur (risque d'écart entre le rendu serveur et l'hydratation).

## D40 : Animations : premier affichage, sans JavaScript et mouvement réduit

- **Date** : 2026-11-16 (Prompt 02)
- **Décision** : Les éléments animés portent l'attribut `data-reveal`. Une règle CSS les affiche directement (opacité 1, aucun déplacement) quand l'utilisateur demande moins d'animations (`prefers-reduced-motion`), et une règle dans `noscript` fait de même sans JavaScript. La transition entre pages ne joue pas au premier chargement, seulement lors des navigations.
- **Raison** : Le contenu reste lisible sans JavaScript et dès le premier rendu pour les personnes qui réduisent les animations, sans attendre l'hydratation. Ne pas animer le premier chargement évite de retarder le premier affichage (LCP).
- **Alternative écartée** : Détection du réglage en JavaScript seulement (contenu caché jusqu'à l'hydratation) ; transition aussi au premier chargement.

## D41 : Titre du hero animé en CSS au Prompt 04

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : Au Prompt 04, le titre du hero est révélé mot par mot avec une animation CSS (comme le prototype), et non avec `WordReveal` en Motion. Le composant `WordReveal` reste utilisé sur la page d'accueil minimale jusqu'à son remplacement.
- **Raison** : Une animation CSS démarre dès le premier rendu, sans attendre l'hydratation de JavaScript : le titre, probable élément LCP, s'affiche plus tôt. Les animations restent coupées avec `prefers-reduced-motion`.
- **Alternative écartée** : `WordReveal` en Motion (animation lancée seulement après l'hydratation, LCP retardé).

## D42 : Client Supabase sans session pour les lectures publiques

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : `src/lib/supabase/public.ts` crée un client supabase-js sans session (`persistSession`, `autoRefreshToken` et `detectSessionInUrl` à false), clé anon, typé avec `Database`, protégé par `server-only`. Il sert à toutes les lectures publiques mises en cache et à `/api/keepalive`. Le client à cookies (`server.ts`) n'est jamais utilisé dans une fonction `"use cache"` et reste réservé aux usages authentifiés (Prompt 09).
- **Raison** : Avec Cache Components, une fonction `"use cache"` ne peut pas lire les cookies. Une lecture publique n'a pas besoin de session : la clé anon et la RLS suffisent.
- **Alternative écartée** : Client à cookies dans les fonctions mises en cache (erreur `next-request-in-use-cache`) ; lecture sans cache (une requête à la base à chaque visite).

## D43 : Build sans variables Supabase

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : Si les variables Supabase manquent pendant `next build` (détecté par `NEXT_PHASE`), `getSiteSettings()` écrit un avertissement explicite dans les logs du build et renvoie null : la page est prérendue sans les blocs qui dépendent de la base. À l'exécution (hors build), une variable manquante lève l'erreur claire de `getSupabaseEnv()`. Une erreur renvoyée par Supabase (clé invalide, base injoignable) n'est jamais avalée : elle fait échouer le build ou la requête avec un message en français.
- **Raison** : Solution la plus simple qui respecte à la fois « build sans secrets » (intégration continue, build local) et « erreur claire à l'exécution » : le seul cas toléré est l'absence de variables pendant le build, toujours signalée dans les logs. Testé dans les deux cas (avec et sans variables) et avec une erreur Supabase simulée.
- **Alternative écartée** : Rendu dynamique de toutes les pages (perte du prérendu et des performances) ; échec du build sans variables (contraire à la méthode) ; valeurs de secours en dur (coordonnées dupliquées dans le code).

## D44 : Durée de cache des réglages

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : `getSiteSettings()` utilise `cacheTag("settings")` et `cacheLife("max")`. Les étiquettes sont des constantes partagées dans `src/lib/data/tags.ts`.
- **Raison** : Les réglages ne changent que par le dashboard, qui invalidera l'étiquette `settings` à chaque enregistrement (Prompt 09) : c'est le cas décrit par la documentation de Next.js 16 pour une longue durée de cache avec étiquette. Jusqu'au Prompt 09, une modification faite directement dans Supabase apparaît au déploiement suivant (redéploiement).
- **Alternative écartée** : Durée courte (`hours`, `days`), qui multiplie les lectures de la base sans utilité une fois la revalidation par étiquette en place.

## D45 : Route keepalive

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : `GET /api/keepalive` appelle `connection()` (jamais mise en cache), compare l'en-tête `Authorization` à `Bearer CRON_SECRET` à temps constant (empreintes SHA-256 comparées avec `timingSafeEqual`, de longueur toujours égale), répond 401 sans détail en cas d'échec, 500 avec un message clair si `CRON_SECRET` manque, puis lit une ligne de `site_settings` (colonne `id` seulement) et renvoie `{ ok, at }`. Planification Vercel `0 6 */6 * *` et région `cdg1` dans `vercel.json`.
- **Raison** : Le secret ne peut pas être deviné par mesure du temps de réponse, la longueur du secret ne fuit pas, et la réponse ne contient aucune donnée de la base.
- **Alternative écartée** : Comparaison directe des chaînes (sensible au temps) ; GitHub Action planifiée (décision D07).

## D46 : Intégration continue GitHub Actions

- **Date** : 2026-11-17 (Prompt 03)
- **Décision** : `.github/workflows/ci.yml` : à chaque push et pull request vers `main`, Node 22, `npm ci`, lint, types, tests et build, sans aucune variable d'environnement ni secret, avec des droits en lecture seule sur le dépôt.
- **Raison** : Vérifie automatiquement chaque push, y compris la règle « build sans secrets ».
- **Alternative écartée** : Vérifications seulement dans la session de Claude Code (aucune trace sur GitHub).

## D47 : Build Vercel sans variables Supabase : échec (complète D43)

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : D43 reste valable hors de Vercel : sans variables Supabase, un build de l'intégration continue ou un build local réussit avec un avertissement et des pages sans données. Sur Vercel (`process.env.VERCEL` vaut "1"), l'absence d'une variable fait échouer le build avec le message de `getSupabaseEnv()` (nom de la variable, où la saisir). La logique est centralisée dans `publicDataClient()` (`src/lib/data/source.ts`), utilisée par toutes les lectures publiques.
- **Raison** : Un oubli de variable dans Vercel ne doit jamais déployer silencieusement un site sans données ; l'intégration continue doit continuer à tourner sans secret. Testé : `VERCEL=1` sans variables, échec ; sans `VERCEL` ni variables, succès avec avertissement.
- **Alternative écartée** : Garder D43 telle quelle (déploiement possible sans données, seul signal dans les logs du build).

## D48 : Hero : pas de vidéo de fond sur mobile

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : La vidéo de fond du showreel n'est chargée que sur écran large (plus de 820 px), sans `prefers-reduced-motion` et sans économiseur de données (Save-Data), après l'hydratation. Sinon, la miniature du showreel est affichée en fond avec un voile sombre. Le bouton et la fenêtre modale avec le son restent disponibles partout.
- **Raison** : Économie de données mobiles (une vidéo en boucle consomme plusieurs mégaoctets), respect des préférences de l'utilisateur, et LCP préservé : le titre du hero reste l'élément LCP.
- **Alternative écartée** : Vidéo de fond sur tous les écrans, comme le prototype.

## D49 : Bandeau des clients en CSS

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : Le bandeau « Ils nous font confiance » défile par une animation CSS (`@keyframes marquee`), en pause au survol et au focus (bandeau focusable au clavier), avec une grille fixe sans copie quand les animations sont réduites.
- **Raison** : Boucle infinie sans coût JavaScript, active dès le premier rendu, avant l'hydratation, comme dans le prototype.
- **Alternative écartée** : Animation Motion (JavaScript chargé et exécuté pour une simple boucle).

## D50 : Animations décoratives du hero en CSS

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : La lumière turquoise qui dérive (repli sans showreel) et l'apparition de la ligne au-dessus du titre et du bouton du showreel sont aussi en CSS, comme le titre (D41), coupées avec `prefers-reduced-motion`.
- **Raison** : Même raison que D41 : le hero s'anime dès le premier rendu, sans attendre l'hydratation, et ne retarde pas le LCP.
- **Alternative écartée** : Motion pour ces animations (dépendance au chargement de JavaScript dans le hero).

## D51 : Fenêtre modale du showreel en élément <dialog> natif

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : La fenêtre modale utilise `<dialog>` avec `showModal()` : reste de la page inerte, focus maintenu dans la fenêtre, fermeture par Échap, par le bouton et par un clic sur le fond, retour du focus au bouton d'ouverture, défilement bloqué, iframe créée à l'ouverture et retirée à la fermeture.
- **Raison** : Comportement d'accessibilité fourni par le navigateur, plus fiable qu'un piégeage du focus écrit à la main. Limite connue : quand le focus est à l'intérieur du lecteur YouTube (après un clic dans la vidéo), la touche Échap est reçue par la page de YouTube, d'un autre domaine, et ne ferme pas la fenêtre ; le bouton de fermeture et le clic sur le fond restent disponibles.
- **Alternative écartée** : Fenêtre modale écrite à la main avec piégeage du focus en JavaScript (même limite avec une iframe d'un autre domaine).

## D52 : Grille de la sélection de l'accueil

- **Date** : 2026-11-17 (Prompt 04)
- **Décision** : La sélection de l'accueil reprend la grille du prototype pour l'accueil (classe `.grid` : deux colonnes égales au-dessus de 820 px, une colonne en dessous). Le rythme 7/5, 5/7 (`.grid--ed`) est réservé à la page Réalisations (Prompt 05).
- **Raison** : Le prototype prime pour le visuel : sur l'accueil, il utilise la grille à deux colonnes égales.
- **Alternative écartée** : Rythme 7/5, 5/7 sur l'accueil aussi.

## D53 : Miniatures YouTube sans l'optimisation de Vercel

- **Date** : 2026-11-17 (Prompt 05)
- **Décision** : Toutes les miniatures `i.ytimg.com` (accueil, réalisations, fiches) sont affichées avec `unoptimized` dans `YouTubeThumbnail`, dans un conteneur de ratio fixe (16:10 ou 16:9) avec `fill` : CLS nul. Les images du bucket `media` restent optimisées par `next/image`.
- **Raison** : Le quota d'optimisation d'images de l'offre gratuite de Vercel est réservé aux images du site ; YouTube sert déjà des miniatures JPEG compressées à des tailles fixes.
- **Alternative écartée** : Optimisation de toutes les images par Vercel (quota consommé par des images déjà légères).

## D54 : Filtre de la page Réalisations dans le navigateur

- **Date** : 2026-11-17 (Prompt 05)
- **Décision** : La page Réalisations est entièrement statique : le serveur rend tous les projets publiés, le filtre par catégorie s'applique dans le navigateur. La catégorie active est écrite dans l'URL (`?categorie=film-institutionnel`, forme sans accents ni espaces) avec `history.replaceState`, et relue au chargement avec `useSyncExternalStore` (aucune lecture de `searchParams` côté serveur). Une valeur inconnue revient à « Tous ».
- **Raison** : Moins de 40 projets : filtrer dans le navigateur est instantané et garde la page prérendue (performance, Lighthouse). L'URL permet de partager ou recharger un filtre.
- **Alternative écartée** : Lecture de `searchParams` côté serveur (page rendue à chaque requête) ; une page par catégorie.

## D55 : Paramètres statiques des fiches projet

- **Date** : 2026-11-17 (Prompt 05)
- **Décision** : `generateStaticParams` prérend la fiche de chaque projet publié. Un projet publié plus tard est rendu à sa première visite puis mis en cache. Si la liste est vide (build sans base, hors Vercel), une valeur de validation `aucun-projet` est renvoyée, car Cache Components exige au moins un paramètre ; sa page est une 404.
- **Raison** : Pages des projets servies statiquement, sans redéploiement quand un projet est publié, et build sans variables toujours possible.
- **Alternative écartée** : `dynamicParams = false` (un projet publié après le build resterait en 404 jusqu'au déploiement suivant).

## D56 : Piégeage explicite du focus dans les fenêtres modales

- **Date** : 2026-11-17 (Prompt 05)
- **Décision** : Les fenêtres `<dialog>` (showreel, visionneuse de photos) bouclent Tab et Maj+Tab sur leurs éléments focusables (`src/lib/focus-trap.ts`), en plus du comportement natif de `showModal()`.
- **Raison** : Sans cela, la tabulation sortait vers l'interface du navigateur avant de revenir dans la fenêtre (constaté au test de la visionneuse).
- **Alternative écartée** : Comportement natif seul de `<dialog>`.

## D57 : Dimensions des photos de projet

- **Date** : 2026-11-17 (Prompt 05)
- **Décision** : Les vignettes de la maçonnerie utilisent `next/image` avec des dimensions de référence 1800 x 1200 et une hauteur automatique : l'image garde ses proportions réelles une fois chargée. La visionneuse affiche la photo en `object-contain` dans un cadre fixe.
- **Raison** : La base ne stocke pas les dimensions des photos ; la plupart des photos de tournage sont en paysage 3:2. Les vignettes sont sous la ligne de flottaison et chargées à la demande.
- **Alternative écartée** : Ajouter les dimensions en base (nouvelle migration, hors périmètre de ce prompt).

## D58 : Textes fixes de la marque dans le code

- **Date** : 2026-11-17 (Prompt 06)
- **Décision** : Les textes des pages Services et Le studio (services, méthode, arguments, présentation, français et wolof, équipement) sont regroupés dans `src/content/marque.ts` ; les identifiants légaux et la date des mentions légales dans `src/content/mentions-legales.ts`. Ils ne sont pas en base.
- **Raison** : Ce sont des textes stables de la marque, validés dans le prototype, que le dashboard ne prévoit pas de modifier (cahier 7) : un fichier unique de contenu les rend faciles à relire et à corriger dans un prompt, sans migration.
- **Alternative écartée** : Tables en base et écrans d'administration pour ces textes (hors périmètre du cahier).

## D59 : Première rangée d'une page sans animation d'apparition

- **Date** : 2026-11-17 (Prompt 06)
- **Décision** : Le composant `SectionRow` (rangée éditoriale du prototype) anime son apparition au défilement, sauf la première rangée d'une page (`first`), affichée directement.
- **Raison** : La première rangée est visible dès l'ouverture : animée, elle attendait JavaScript puis 0,8 s d'animation, et son paragraphe devenait l'élément LCP (3 s mesurées sur Le studio). Sans animation : LCP de 0,8 s.
- **Alternative écartée** : Animer toutes les rangées, comme le prototype.

## D60 : Compteurs de la page Le studio

- **Date** : 2026-11-17 (Prompt 06)
- **Décision** : Chaque chiffre clé est rendu côté serveur à sa valeur finale (lisible sans JavaScript, copie unique pour les lecteurs d'écran). Dans le navigateur, sauf mouvement réduit, il repart de 0 puis monte jusqu'à la valeur en 1,3 s quand il est visible à 60 %, une seule fois, avec `animate` et `useInView` de Motion. Seule la partie numérique en tête est animée (« 20+ », « 4K », « 24h ») ; une valeur sans chiffre en tête s'affiche telle quelle.
- **Raison** : Comportement du prototype et du cahier 4.5, avec Motion pour l'animation (CLAUDE.md), sans perte d'information sans JavaScript.
- **Alternative écartée** : Compteur en CSS (impossible de compter un nombre sans JavaScript) ; valeur 0 rendue côté serveur (illisible sans JavaScript).

## D61 : Hébergeur dans les mentions légales

- **Date** : 2026-11-17 (Prompt 06)
- **Décision** : Les mentions légales indiquent « Vercel Inc. » et le site vercel.com, sans adresse postale.
- **Raison** : L'adresse publiée par Vercel n'a pas pu être vérifiée depuis la session de développement (site injoignable) : aucune information non vérifiée n'est publiée.
- **Alternative écartée** : Recopier une adresse de mémoire, sans vérification.

## D62 : Limitation des envois du formulaire de contact

- **Date** : 2026-11-17 (Prompt 07)
- **Décision** : Chaque envoi valide enregistre dans `contact_submissions` (migration 0002) une empreinte HMAC-SHA256 de l'adresse IP (première valeur de `x-forwarded-for`, sinon `x-real-ip`). La clé de l'empreinte est dérivée de `SUPABASE_SERVICE_ROLE_KEY` par un HMAC avec un libellé fixe, sans nouvelle variable. Au plus 3 envois par empreinte sur une heure glissante ; au-delà, réponse 429 avec un message clair et rien n'est enregistré. Les lignes de plus de 24 heures sont purgées à chaque envoi accepté. Table accessible à la seule clé service (RLS sans policy, droits retirés aux rôles publics).
- **Raison** : Applique D10 : une limite gardée en mémoire ne tient pas sur Vercel ; l'adresse IP n'est jamais stockée en clair et l'empreinte ne peut pas être recalculée sans le secret serveur.
- **Alternative écartée** : Empreinte SHA-256 simple (recalculable par force brute sur l'espace des adresses IPv4) ; service externe de limitation (compte et secret supplémentaires).

## D63 : Formulaire de contact sans JavaScript

- **Date** : 2026-11-17 (Prompt 07)
- **Décision** : Le formulaire envoie aussi en POST classique vers `/api/contact`, qui répond par une redirection 303 vers `/contact?envoye=1#demande-envoyee` ou vers `/contact#demande-incomplete`, `#demande-limite`, `#demande-erreur`. La page reste statique : le message correspondant est affiché par le sélecteur CSS `:target`. Avec JavaScript, l'envoi se fait en `fetch` (réponses JSON) et la réponse s'affiche dans la page, sans rechargement.
- **Raison** : Le formulaire reste utilisable sans JavaScript, sans rendre la page Contact dynamique.
- **Alternative écartée** : Lecture des paramètres d'URL côté serveur (page rendue à chaque requête) ; formulaire inutilisable sans JavaScript.

## D64 : Adresse de l'hébergeur (complète D61)

- **Date** : 2026-11-17 (Prompt 07)
- **Décision** : Les mentions légales indiquent désormais l'adresse de Vercel Inc. : 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis.
- **Raison** : Adresse vérifiée par Claude dans la politique de confidentialité de Vercel et transmise dans le Prompt 07.
- **Alternative écartée** : Garder la seule raison sociale.

## D65 : Bibliothèques du formulaire et des emails

- **Date** : 2026-11-17 (Prompt 07)
- **Décision** : `zod` 4.6.7 (validation partagée entre le navigateur et le serveur) et `resend` 6.38.1 (SDK officiel d'envoi des emails). Versions exactes dans `package.json`.
- **Raison** : Choix de la stack (CLAUDE.md) ; versions stables les plus récentes au 17 novembre 2026.
- **Alternative écartée** : Validation écrite à la main ; appels HTTP directs à l'API de Resend.

## D66 : Limite du formulaire portée à 5 envois par heure (complète D62)

- **Date** : 2026-11-17 (Prompt 08)
- **Décision** : La limite du formulaire de contact passe de 3 à 5 envois par heure glissante et par empreinte d'IP. Les constantes et la règle sont regroupées dans `src/lib/contact/rate-limit.ts`, couvert par les tests.
- **Raison** : Les opérateurs mobiles sénégalais partagent souvent une même adresse IP entre de nombreux abonnés : 3 envois risquaient de bloquer de vrais visiteurs.
- **Alternative écartée** : Garder 3 envois par heure (D62).

## D67 : En-têtes de sécurité HTTP

- **Date** : 2026-11-17 (Prompt 08)
- **Décision** : Toutes les réponses portent `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` et `Permissions-Policy: camera=(), microphone=(), geolocation=()` (`next.config.ts`). Les réponses JSON de `/api/contact` portent `Cache-Control: no-store`. Une politique de sécurité du contenu (CSP) complète est reportée au Prompt 13.
- **Raison** : Protection de base sans effet sur le site : aucune page n'a besoin d'être intégrée dans un cadre, et la politique de référent reste celle par défaut des navigateurs, compatible avec les lecteurs YouTube.
- **Alternative écartée** : Aucun en-tête (situation avant l'audit) ; CSP complète dès maintenant (à régler finement avec YouTube, Supabase et les styles de Next.js).

## D68 : Page d'erreur du site

- **Date** : 2026-11-17 (Prompt 08)
- **Décision** : `src/app/error.tsx` affiche, dans la charte de la page 404, « Une erreur est survenue », un bouton « Réessayer » et un lien vers l'accueil, quand une page ne peut pas être rendue (base de données indisponible par exemple).
- **Raison** : Sans elle, le visiteur voyait la page d'erreur brute de Next.js.
- **Alternative écartée** : Page d'erreur par défaut de Next.js.

## D69 : Lectures mises en cache sans erreur levée dans le cache

- **Date** : 2026-11-17 (Prompt 08)
- **Décision** : Chaque lecture publique est découpée en deux : une fonction `"use cache"` qui passe par `cachedRead()` (`src/lib/data/source.ts`) et renvoie un résultat (données, ou message d'erreur), puis une fonction publique qui appelle `unwrap()` et lève l'erreur hors du cache. `cacheLife` est conditionnel : `max` en cas de succès, `seconds` en cas d'échec (l'échec n'est pas gardé). `getNextProject()` n'a plus de cache propre : il est calculé à partir de `getProjects()`.
- **Raison** : Constaté à l'audit : une erreur levée à l'intérieur d'une fonction `"use cache"` pendant un rendu à la demande (fiche d'un projet publié après le build, base indisponible) bloquait la réponse au visiteur plus de 110 s, jusqu'au délai maximal de Vercel. Avec ce découpage, la page d'erreur répond immédiatement ; une erreur au build fait toujours échouer le build (jamais avalée, D43, D47).
- **Alternative écartée** : Lever l'erreur dans la fonction mise en cache (réponse bloquée) ; avaler l'erreur et renvoyer des données vides (erreur masquée).

## D70 : Protection du dashboard en deux couches

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : `src/proxy.ts` (convention Next.js 16, ex-middleware) ne s'exécute que sur `/admin` et `/admin/...`. Il rafraîchit la session Supabase, renvoie vers `/admin/login` sans session, ferme la session d'un compte connecté qui n'est pas dans `admin_users` (« Accès réservé aux administrateurs ») et pose `Cache-Control: no-store`. Pages ouvertes sans session : `/admin/login`, `/admin/mot-de-passe-oublie`, `/admin/confirmer` ; `/admin/nouveau-mot-de-passe` exige une session (celle du lien de réinitialisation). Deuxième couche : `requireAdmin()` (getUser puis `is_admin`) en tête de chaque page protégée et de chaque Server Action. Toutes les écritures passent par le client à cookies (RLS `is_admin`), jamais par la clé service.
- **Raison** : Seul le proxy peut écrire les cookies (rafraîchissement, déconnexion) ; les Server Actions restent appelables directement, d'où la seconde vérification. Le proxy ne touche pas les pages publiques, qui restent statiques.
- **Alternative écartée** : Proxy sur tout le site (pages publiques rendues dynamiques) ; vérification uniquement dans les pages (cookies jamais rafraîchis).

## D71 : Publication immédiate par updateTag

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : Après chaque enregistrement réussi des réglages ou du showreel, la Server Action appelle `updateTag(CACHE_TAGS.settings)`. La requête suivante sur le site relit la base. Un enregistrement qui ne modifie aucune ligne (écriture refusée par la RLS) est signalé comme un échec, sans invalidation.
- **Raison** : Cahier 7.7 (modification visible en moins de 10 secondes). `updateTag` est l'API de Next.js 16 réservée aux Server Actions, avec lecture de ses propres écritures ; `revalidateTag` sert l'ancienne valeur une dernière fois.
- **Alternative écartée** : `revalidateTag` (une visite avec l'ancienne valeur) ; durée de cache courte (site plus lent, base plus sollicitée).

## D72 : Groupe de routes (site) pour les pages publiques

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : Les pages publiques, leur transition (`template.tsx`) et leur page d'erreur sont dans `src/app/(site)/`, dont la mise en page ajoute l'en-tête et le pied de page. La mise en page racine ne garde que le document, la police, `noindex` et le lien d'évitement. La page 404 racine ajoute elle-même l'en-tête et le pied de page. Les adresses ne changent pas.
- **Raison** : Le dashboard ne doit afficher ni la navigation publique ni le pied de page du site.
- **Alternative écartée** : Masquer l'en-tête selon l'adresse dans un composant client (rendu plus lourd, logique fragile).

## D73 : Adresses des onglets du dashboard

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : Chaque onglet a son adresse (`/admin/showreel`, `/admin/reglages`, puis les suivants aux Prompts 10 et 11) dans le groupe `src/app/admin/(dashboard)/`. `/admin` ouvre `/admin/showreel`, qui est aussi la page d'arrivée après la connexion. Seuls les onglets existants sont affichés. Les réglages sont relus dans le dashboard par le client à cookies, sans cache (`getAdminSettings()`), dans une frontière Suspense.
- **Raison** : Le prototype affiche tous les onglets sur une seule page ; des adresses distinctes permettent le retour arrière, le lien direct et l'onglet actif (`aria-current`). La lecture sans cache montre toujours la valeur réellement enregistrée.
- **Alternative écartée** : Une page unique avec onglets en état local (adresse non partageable).

## D74 : Lien de réinitialisation au format token_hash

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : L'email « Reset password » de Supabase pointe vers `{{ .SiteURL }}/admin/confirmer?token_hash={{ .TokenHash }}&type=recovery`. La route `/admin/confirmer` appelle `verifyOtp` (type recovery), puis renvoie vers `/admin/nouveau-mot-de-passe` ; un lien invalide, expiré ou déjà utilisé renvoie vers `/admin/mot-de-passe-oublie?lien=invalide` avec un message clair. La demande de lien répond toujours « Si un compte existe pour cette adresse, un email vient d’être envoyé. » Après le nouveau mot de passe, le visiteur arrive sur le dashboard avec la notification « Mot de passe modifié. » (un compte non administrateur est refusé par le proxy).
- **Raison** : Format recommandé par Supabase pour un rendu serveur (fonctionne même si le lien est ouvert dans un autre navigateur que celui de la demande, contrairement au flux PKCE). La réponse identique ne révèle pas l'existence d'un compte.
- **Alternative écartée** : Lien par défaut `{{ .ConfirmationURL }}` (jeton dans le fragment d'URL, illisible côté serveur).

## D75 : Écarts assumés avec le prototype du dashboard

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : Pas de bouton « Publier » ni de badge « Modifications non publiées » dans la barre (la publication est immédiate, D71) ; à la place, la barre affiche l'email du compte connecté et « Déconnexion ». « Retirer le showreel » demande une confirmation. Les chiffres clés sont une liste de 0 à 4 lignes avec « Ajouter un chiffre clé » et « Retirer », au lieu de 4 lignes fixes. Mots de passe : 12 caractères minimum, 72 au maximum (limite de Supabase Auth).
- **Raison** : Le cahier prime pour le fonctionnel (règle d'or) ; le prototype fonctionnait par export de fichier.
- **Alternative écartée** : Reproduire le bouton « Publier » (bouton factice).

## D76 : Client Supabase serveur : cookies lus avant les variables

- **Date** : 2026-11-17 (Prompt 09)
- **Décision** : `createClient()` (`src/lib/supabase/server.ts`) lit les cookies avant de vérifier les variables d'environnement.
- **Raison** : Pendant le build, la lecture des cookies suspend le prérendu des pages du dashboard (rendu à la requête) ; dans l'ordre inverse, un build sans variables échouait sur les pages du dashboard. À l'exécution, une variable absente lève toujours l'erreur claire de `missingVariableError` (D43).
- **Alternative écartée** : Rendre les pages du dashboard entièrement dynamiques par une option de segment (incompatible avec Cache Components).

## D77 : Dimensions des photos (migration 0003, complète D57)

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : `project_photos.width` et `height` (int, nullables, strictement positifs si renseignés) sont enregistrés au téléversement. La fiche publique les passe à `next/image` (place exacte réservée, aucun saut de mise en page) ; sans dimensions, la règle de D57 (1800 x 1200, hauteur automatique) s'applique. La fiche lit les photos avec `project_photos(*)` pour fonctionner avant comme après l'exécution de 0003.
- **Raison** : Le dashboard connaît la taille de chaque image ; le déploiement Vercel précède l'exécution de la migration par Ziza.
- **Alternative écartée** : Sélection explicite des colonnes (fiche cassée tant que 0003 n'est pas exécutée).

## D78 : Création d'un projet en deux temps, médias enregistrés immédiatement

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : « Créer le projet » enregistre informations, adresse, livrables et vidéos ; la miniature et les photos s'ajoutent ensuite sur la page du projet. Chaque téléversement, remplacement ou suppression de miniature ou de photo est enregistré aussitôt (Server Action) ; l'ordre et les textes alternatifs des photos, comme le reste du formulaire, sont enregistrés par « Enregistrer le projet ». Un nouveau projet est placé en fin de liste, en brouillon (case « Publié » décochée), année en cours proposée.
- **Raison** : Les fichiers sont rangés sous l'identifiant du projet ; sans projet en base, un formulaire abandonné laisserait des fichiers orphelins.
- **Alternative écartée** : Identifiant généré dans le navigateur et fichiers envoyés avant la création (orphelins en cas d'abandon).

## D79 : Téléversement direct et compression dans le navigateur

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : Les images sont réduites dans le navigateur (photos 2400 px, miniature 1600 px sur le grand côté, orientation corrigée), encodées en WebP qualité 0,82, puis envoyées directement au bucket `media` avec le client navigateur à cookies (policies is_admin). Si le navigateur ne sait pas encoder le WebP (certaines versions de Safari), l'image est encodée en JPEG 0,82 et le chemin finit par `.jpg`. Un fichier qui n'est pas une image (PDF par exemple) ou un SVG est refusé avec un message clair. Ces valeurs remplacent celles du cahier 7.2 (1800 px, JPEG 82 %) à la demande du Prompt 10.
- **Raison** : Les Server Actions de Vercel limitent la taille des requêtes ; les photos de téléphone dépassent souvent 5 Mo.
- **Alternative écartée** : Envoi par une Server Action ; compression côté serveur (dépendance lourde).

## D80 : Chemins de stockage et aucun fichier orphelin

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : Photos `projects/<id du projet>/<uuid>.webp`, miniatures `thumbs/<id du projet>-<uuid>.webp` (aucun nom de fichier fourni par l'utilisateur). Les Server Actions n'acceptent que ces chemins pour le projet concerné. Enregistrement en base refusé ou en échec : le fichier est supprimé (par l'action, ou par `discardUploads`, qui ne supprime jamais un fichier encore référencé). Photo supprimée ou miniature remplacée ou retirée : fichier supprimé. Projet supprimé : fichiers connus en base, plus tout fichier du dossier `projects/<id>/` et toute miniature `thumbs/<id>-...`, supprimés. Un échec de suppression de fichier est consigné sans bloquer l'action.
- **Raison** : Prompt 10 (D, point 4) ; le bucket n'est pas parcouru par d'autres règles.
- **Alternative écartée** : Nettoyage périodique du bucket.

## D81 : Ordre des listes par boutons, sans glisser-déposer

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : Projets, livrables, vidéos et photos se réordonnent avec des boutons Monter et Descendre (Placer avant et après pour les photos), nommés pour les lecteurs d'écran, le focus restant sur le bouton de l'élément déplacé. L'ordre des projets est enregistré immédiatement en une seule Server Action (positions de tous les projets) ; celui des livrables, vidéos et photos avec le projet. Les livrables sont une liste de lignes (et non un champ multiligne comme dans le prototype), à la demande du Prompt 10.
- **Raison** : Le prototype n'utilise que des boutons ; le glisser-déposer accessible au clavier aurait demandé une dépendance.
- **Alternative écartée** : Glisser-déposer.

## D82 : Écritures des projets sans transaction SQL

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : L'enregistrement d'un projet enchaîne la ligne du projet, puis les vidéos (mises à jour et ajouts avant les retraits), puis la position et le texte alternatif des photos. En cas d'échec partiel, un message dit ce qui n'a pas été enregistré ; rien n'est supprimé avant que le reste ait réussi. L'adresse est vérifiée avant l'écriture (message clair si elle est prise) et l'erreur d'unicité de la base est aussi traduite.
- **Raison** : Une fonction SQL transactionnelle aurait demandé une migration hors du périmètre de 0003.
- **Alternative écartée** : Fonction RPC transactionnelle (à envisager si un besoin apparaît).

## D83 : Dashboard et pages gardées en mémoire par le routeur

- **Date** : 2026-11-17 (Prompt 10)
- **Décision** : `requireAdmin()` appelle `connection()` avant de lire la session (la vérification du jeton lit l'heure, interdite pendant un prérendu ; erreurs constatées au journal depuis le Prompt 09). Les identifiants HTML de l'éditeur de projet sont préfixés par `useId()`. La liste des projets reprend les données du serveur quand elles changent ; la page « Nouveau projet » est vidée après la création ; une notification n'est jamais réaffichée en entier au retour sur une page ; la notification transmise par l'adresse est retirée avec `history.replaceState(null, ...)`. La navigation du dashboard est lue dans une frontière Suspense (adresse dynamique `/admin/projets/[id]`).
- **Raison** : Next.js 16 garde les pages quittées en mémoire (masquées) : identifiants en double, états anciens réaffichés.
- **Alternative écartée** : Clé aléatoire à chaque rendu (formulaire remonté après chaque action serveur, téléversement interrompu).

## D84 : Image des cartes de projet

- **Date** : 2026-11-17 (Prompt 11, arbitrage du rapport du Prompt 10)
- **Décision** : La carte d'un projet (accueil, Réalisations) affiche, dans l'ordre : la miniature téléversée, sinon la miniature de la première vidéo, sinon la première photo (par position), sinon la carte typographique. Les lectures publiques récupèrent le chemin de la première photo dans la même requête (relation `first_photo` limitée à une ligne), sans requête par projet. La règle est une fonction pure testée (`coverImagePath`, `src/lib/project-cover.ts`), reprise par les aperçus du dashboard et par l'image Open Graph de la fiche. Pas de bouton « utiliser une photo comme miniature ».
- **Raison** : Une photo supprimée casserait une miniature qui pointerait vers son fichier.
- **Alternative écartée** : Copier le chemin d'une photo dans `thumbnail_path`.

## D85 : Onglet Clients, enregistrement par action

- **Date** : 2026-11-17 (Prompt 11)
- **Décision** : Chaque action de l'onglet Clients est enregistrée aussitôt (ajout, nom, logo, « Afficher en blanc », ordre, suppression), au lieu du bouton « Enregistrer les clients » du prototype. Un client est d'abord ajouté par son nom, puis son logo s'ajoute sur sa ligne. Logo : réduit à 520 px, WebP avec transparence, repli PNG si le navigateur ne sait pas encoder le WebP (arbitrage du Prompt 10), chemin `clients/<id>-<uuid>.webp|png`, SVG refusé. Aperçu sur fond sombre avec le même filtre que le bandeau (gris, ou blanc). Les saisies de nom en cours sont conservées quand la page reçoit de nouvelles données du serveur.
- **Raison** : Les fichiers sont rangés sous l'identifiant du client (aucun orphelin, D80) ; le site est mis à jour à chaque action (D71).
- **Alternative écartée** : Enregistrement groupé de toute la liste.

## D86 : Onglet Équipe et recadrage 4:5

- **Date** : 2026-11-17 (Prompt 11)
- **Décision** : Mêmes principes que D85 (ajout par le nom et le titre, puis photo et présentation sur la ligne ; nom, titre et présentation enregistrés par le bouton « Enregistrer » de la ligne). Photo recadrée dans le navigateur au format 4:5 : centrée en largeur, position verticale au choix (Haut, Centre, Bas), aperçu de l'image exacte qui sera envoyée, 1000 px de large, WebP (repli JPEG), chemin `team/<id>-<uuid>`. Présentation : une ligne de 300 caractères au plus. Les chemins statiques (`/team/...`, photos de départ, D06) ne sont jamais envoyés à la suppression du bucket (`removeMediaFiles`, `src/lib/admin/storage.ts`).
- **Raison** : Cahier 7.4 et Prompt 11 ; un recadrage libre aurait demandé une dépendance.
- **Alternative écartée** : Recadrage libre à la souris.

## D87 : Effacement automatique des messages (P11)

- **Date** : 2026-11-17 (Prompt 11)
- **Décision** : `/api/keepalive` (cron tous les 6 jours, `CRON_SECRET`) efface les lignes de `contact_messages` reçues il y a plus de 24 mois calendaires (`retentionCutoff`, testée), avec le client service : deuxième et dernier usage autorisé de la clé service, après `/api/contact`. La réponse ne contient que `{ ok, deleted }` ; les logs ne contiennent que le nombre de messages effacés. Cette requête maintient aussi la base active.
- **Raison** : Les mentions légales annoncent une conservation de 24 mois ; la route du cron existe et est protégée.
- **Alternative écartée** : Fonction planifiée dans Postgres (pg_cron, réglage hors dépôt) ; bouton manuel dans le dashboard.

## D88 : Onglet Messages

- **Date** : 2026-11-17 (Prompt 11)
- **Décision** : Liste du plus récent au plus ancien, 30 par page, filtres Tous, À traiter, Traités dans l'adresse (`?filtre=a-traiter`, `?page=2`). Date et heure à l'heure de Dakar (fr-FR). Message affiché en texte brut (React échappe le HTML, sauts de ligne conservés). Actions : marquer traité ou à traiter, répondre (mailto, objet « Votre demande à MANA PROD »), supprimer en deux temps. Après chaque action, `refresh()` met à jour la liste et le nombre de messages à traiter affiché dans la navigation (lu par le layout du dashboard, dans une frontière Suspense).
- **Raison** : Cahier 7.6 et Prompt 11.
- **Alternative écartée** : Compteur rafraîchi par interrogation périodique.
