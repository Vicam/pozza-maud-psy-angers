# Contexte du projet

L'objectif de ce projet est de migrer le site Wix de Maud Pozza, psychologue à Angers, vers un site statique qui sera déployé sur Netlify.
Ce site permet principalement d'expliquer l'activité de Maud et de donner les informations de contact et donner le lien pour prendre rendez vous sur l'agenda en ligne.

**URL du site original :** https://www.pozza-maud-psy-angers.com/

## Travail en cours

- **Suppression de la barre de cookies :** La barre de cookies héritée de Wix est non fonctionnelle et superflue pour un site statique. Elle a été masquée via CSS (`.consent-banner-root { display: none !important; }`) dans `site/assets/nav.css`.

## Étapes réalisées

Pour atteindre l'état actuel du projet, les étapes suivantes ont été accomplies :

1.  **Scraping du site Wix :** Le contenu HTML du site original a été récupéré. Les fichiers HTML bruts sont conservés dans le répertoire `out_manual/`.
2.  **Adaptation pour Netlify :** Les fichiers HTML ont été retraités pour assurer leur compatibilité avec la structure de déploiement de Netlify. Le script `tools/convert-manual-html.mjs` a été utilisé pour :
    *   Transformer les noms de fichiers (ex: `psy__prestations.html`) en une structure de dossiers et de fichiers `index.html` (ex: `site/prestations/index.html`).
    *   Normaliser les liens internes pour qu'ils fonctionnent dans l'architecture du site statique.
3.  **Hébergement local des ressources :** Les médias (images) et les scripts initialement hébergés par Wix ont été téléchargés et sont maintenant servis localement depuis le dossier `site/assets/`.
4.  **Découplage de Wix :** Le code JavaScript d'exécution (runtime) de Wix a été supprimé pour rendre le site indépendant de la plateforme Wix.

Le site est maintenant fonctionnel en local et ressemble beaucoup à l'original, bien qu'il subsiste quelques bugs et régressions visuelles mineures.

## Architecture

-   **Source manuelle :** `out_manual/` contient les pages HTML récupérées manuellement.
-   **Site statique généré :** `site/` est le répertoire racine du site statique, prêt à être déployé. C'est le dossier de publication pour Netlify.
-   **Outils :** `tools/` contient les scripts utilisés pour la conversion et la validation.
-   **Archives :** `archive/` contient d'anciennes tentatives de scraping automatisé qui ne sont plus actives.
## Responsive

Cette section r�capitule ce qui a �t� ajout�/modifi� pour rendre le site mobile-first, et comment l�adapter si besoin.

- Chargement CSS/JS (chaque page HTML)
  - `site/assets/tailwind.css`: CSS Tailwind compil� (via `npm run build:css`).
  - `site/assets/responsive.css`: surcouches mobiles et fixes Wix (neutralisation des min-width/offsets, grilles, images fluides, etc.).
  - `site/assets/nav.css` + `site/assets/nav.js`: barre de navigation (desktop + hamburger mobile). Un fallback HTML du nav est pr�sent en haut du `<body>` et `nav.js` l�am�liore.
  - `body class="responsive"` est pr�sent pour lever les `min-width` h�rit�s de Wix.

- Build Tailwind
  - Entr�e: `styles/tailwind.css`; sortie: `site/assets/tailwind.css`.
  - Config: `tailwind.config.js` (content = `site/**/*.html`, `site/**/*.js`) et `postcss.config.js`.
  - Netlify: `netlify.toml` ex�cute `npm ci && npm run build` puis publie `site/`.

- Navigation (comportement)
  - Desktop = 1024px: liens � gauche; � contact strip � (mail + t�l�phone) � droite.
  - Mobile < 760px: bouton hamburger. Au clic, `#custom-nav` re�oit `.open` et la liste appara�t en panneau overlay (position: fixed; sous la barre), ind�pendant du flux Wix.
  - Masquage des menus Wix en mobile pour �viter les conflits avec notre barre.

- Surcouches CSS Wix (responsive.css)
  - Images fluides: `img, video { max-width:100%; height:auto }` et `.pmpaui-image img,.wixui-image img { width:100% !important }`.
  - Neutralisation des min-width/offsets Wix: `#SITE_CONTAINER, #site-root, #masterPage { max-width:100% }`, `[id^="comp-"] { min-width:0 !important }`; reset des `margin-left/left` sur `*inlineContent-gridContainer` en mobile.
  - Grilles: `.pmpaui-column-strip .V5AUxf, .wixui-column-strip .V5AUxf` ? 1 colonne mobile, 2 colonnes = 1024px.
  - Typographies: clamp des polices (`.font_2/3/4/5` pour titres, `.font_1/.font_9` pour paragraphes) afin d��viter tout d�bordement.
  - Texte du header: largeur max + centrage; mail/t�l en block, centr�s; suppression des petites ic�nes qui g�n�raient des chevauchements.
  - Masquages: banni�re cookies Wix et iframe analytics TWIPLA supprim�es; menus Wix masqu�s en mobile.

- Adapter / �tendre
  - Breakpoints: modifier `@media (max-width: 760px)` (mobile) et `@media (min-width: 1024px)` (desktop) dans `nav.css` / `responsive.css`.
  - Contact strip: modifier le HTML inject� dans `site/assets/nav.js` (adresse/num�ro) ou masquer sur desktop/mobile selon besoin.
  - Section r�calcitrante: ajouter une r�gle cibl�e par ID `#comp-�` dans `site/assets/responsive.css` (id�alement sous le bloc mobile).

## Responsive � updates

- Mobile menu: overlay panel under the fixed bar. Adds console logs: "[nav] init" and "[nav] toggle clicked / open state". Global helper: window.__pmpaToggleNav().
- Desktop contacts: legacy mailto/tel anchors from Wix are hidden site-wide on desktop; only the contact strip in the top bar remains visible. (CSS in site/assets/responsive.css)
- Text wrapping: header paragraphs get max-width and side padding on mobile to avoid edge clipping.
