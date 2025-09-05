Contexte: migration d'un site Wix vers un site statique déployé sur Netlify.
Source: https://www.pozza-maud-psy-angers.com/

Entrée: les pages HTML ont été récupérées manuellement et sont stockées dans `out_manual/` selon la convention:
- Domaine remplacé par `psy`, séparateurs `/` remplacés par `__`.
- Exemples: `psy.html` (home), `psy__consultations.html`, `psy__blog__post.html`.

Architecture cible du site statique:
- Dossier `site/` avec une page par route: `site/index.html`, `site/<slug>/index.html`, `site/<slug>/<subslug>/index.html`.
- Les liens internes doivent être normalisés vers des chemins propres: commencent par `/` et se terminent par `/` (sauf la home `/`).

Conversion:
- Script `tools/convert-manual-html.mjs` lit `out_manual/*.html`, calcule la route cible, crée l’arborescence et écrit `site/<route>/index.html`.
- Réécriture des liens internes: 
  - `psy.html` → `/`, `psy__foo.html` → `/foo/`, `psy__foo__bar.html` → `/foo/bar/`.
  - Liens absolus vers le domaine source → chemins internes `/.../`.
  - N’altère pas `mailto:`, `tel:`, ancres `#...` ni liens externes.

Déploiement Netlify:
- `netlify.toml` définit `publish = "site"`. Optionnel: `site/_redirects` pour redirections `.html` → `/`.

Ancien scraping:
- Scripts Playwright et workflow GitHub Actions archivés sous `archive/scrape/` avec `package.json` dédié (dépendances épinglées).
- Aucune dépendance de scraping à la racine; aucun workflow actif.

