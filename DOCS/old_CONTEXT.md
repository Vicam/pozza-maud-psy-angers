# Contexte du projet

L'objectif de ce projet est de migrer le site Wix de Maud Pozza, psychologue √† Angers, vers un site statique qui sera d√©ploy√© sur Netlify.
Ce site permet principalement d'expliquer l'activit√© de Maud et de donner les informations de contact et donner le lien pour prendre rendez vous sur l'agenda en ligne.

**URL du site original :** https://www.pozza-maud-psy-angers.com/

## Travail en cours

- **Suppression de la barre de cookies :** La barre de cookies h√©rit√©e de Wix est non fonctionnelle et superflue pour un site statique. Elle a √©t√© masqu√©e via CSS (`.consent-banner-root { display: none !important; }`) dans `site/assets/nav.css`.

## √âtapes r√©alis√©es

Pour atteindre l'√©tat actuel du projet, les √©tapes suivantes ont √©t√© accomplies :

1.  **Scraping du site Wix :** Le contenu HTML du site original a √©t√© r√©cup√©r√©. Les fichiers HTML bruts sont conserv√©s dans le r√©pertoire `out_manual/`.
2.  **Adaptation pour Netlify :** Les fichiers HTML ont √©t√© retrait√©s pour assurer leur compatibilit√© avec la structure de d√©ploiement de Netlify. Le script `tools/convert-manual-html.mjs` a √©t√© utilis√© pour :
    *   Transformer les noms de fichiers (ex: `psy__prestations.html`) en une structure de dossiers et de fichiers `index.html` (ex: `site/prestations/index.html`).
    *   Normaliser les liens internes pour qu'ils fonctionnent dans l'architecture du site statique.
3.  **H√©bergement local des ressources :** Les m√©dias (images) et les scripts initialement h√©berg√©s par Wix ont √©t√© t√©l√©charg√©s et sont maintenant servis localement depuis le dossier `site/assets/`.
4.  **D√©couplage de Wix :** Le code JavaScript d'ex√©cution (runtime) de Wix a √©t√© supprim√© pour rendre le site ind√©pendant de la plateforme Wix.

Le site est maintenant fonctionnel en local et ressemble beaucoup √† l'original, bien qu'il subsiste quelques bugs et r√©gressions visuelles mineures.

## Architecture

-   **Source manuelle :** `out_manual/` contient les pages HTML r√©cup√©r√©es manuellement.
-   **Site statique g√©n√©r√© :** `site/` est le r√©pertoire racine du site statique, pr√™t √† √™tre d√©ploy√©. C'est le dossier de publication pour Netlify.
-   **Outils :** `tools/` contient les scripts utilis√©s pour la conversion et la validation.
-   **Archives :** `archive/` contient d'anciennes tentatives de scraping automatis√© qui ne sont plus actives.
## Responsive

Cette section rÈcapitule ce qui a ÈtÈ ajoutÈ/modifiÈ pour rendre le site mobile-first, et comment líadapter si besoin.

- Chargement CSS/JS (chaque page HTML)
  - `site/assets/tailwind.css`: CSS Tailwind compilÈ (via `npm run build:css`).
  - `site/assets/responsive.css`: surcouches mobiles et fixes Wix (neutralisation des min-width/offsets, grilles, images fluides, etc.).
  - `site/assets/nav.css` + `site/assets/nav.js`: barre de navigation (desktop + hamburger mobile). Un fallback HTML du nav est prÈsent en haut du `<body>` et `nav.js` líamÈliore.
  - `body class="responsive"` est prÈsent pour lever les `min-width` hÈritÈs de Wix.

- Build Tailwind
  - EntrÈe: `styles/tailwind.css`; sortie: `site/assets/tailwind.css`.
  - Config: `tailwind.config.js` (content = `site/**/*.html`, `site/**/*.js`) et `postcss.config.js`.
  - Netlify: `netlify.toml` exÈcute `npm ci && npm run build` puis publie `site/`.

- Navigation (comportement)
  - Desktop = 1024px: liens ‡ gauche; ´ contact strip ª (mail + tÈlÈphone) ‡ droite.
  - Mobile < 760px: bouton hamburger. Au clic, `#custom-nav` reÁoit `.open` et la liste apparaÓt en panneau overlay (position: fixed; sous la barre), indÈpendant du flux Wix.
  - Masquage des menus Wix en mobile pour Èviter les conflits avec notre barre.

- Surcouches CSS Wix (responsive.css)
  - Images fluides: `img, video { max-width:100%; height:auto }` et `.pmpaui-image img,.wixui-image img { width:100% !important }`.
  - Neutralisation des min-width/offsets Wix: `#SITE_CONTAINER, #site-root, #masterPage { max-width:100% }`, `[id^="comp-"] { min-width:0 !important }`; reset des `margin-left/left` sur `*inlineContent-gridContainer` en mobile.
  - Grilles: `.pmpaui-column-strip .V5AUxf, .wixui-column-strip .V5AUxf` ? 1 colonne mobile, 2 colonnes = 1024px.
  - Typographies: clamp des polices (`.font_2/3/4/5` pour titres, `.font_1/.font_9` pour paragraphes) afin díÈviter tout dÈbordement.
  - Texte du header: largeur max + centrage; mail/tÈl en block, centrÈs; suppression des petites icÙnes qui gÈnÈraient des chevauchements.
  - Masquages: banniËre cookies Wix et iframe analytics TWIPLA supprimÈes; menus Wix masquÈs en mobile.

- Adapter / Ètendre
  - Breakpoints: modifier `@media (max-width: 760px)` (mobile) et `@media (min-width: 1024px)` (desktop) dans `nav.css` / `responsive.css`.
  - Contact strip: modifier le HTML injectÈ dans `site/assets/nav.js` (adresse/numÈro) ou masquer sur desktop/mobile selon besoin.
  - Section rÈcalcitrante: ajouter une rËgle ciblÈe par ID `#comp-Ö` dans `site/assets/responsive.css` (idÈalement sous le bloc mobile).

## Responsive ó updates

- Mobile menu: overlay panel under the fixed bar. Adds console logs: "[nav] init" and "[nav] toggle clicked / open state". Global helper: window.__pmpaToggleNav().
- Desktop contacts: legacy mailto/tel anchors from Wix are hidden site-wide on desktop; only the contact strip in the top bar remains visible. (CSS in site/assets/responsive.css)
- Text wrapping: header paragraphs get max-width and side padding on mobile to avoid edge clipping.
