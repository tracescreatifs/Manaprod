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
