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
