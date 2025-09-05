Archive: scraping Wix avec Playwright

Objectif
- Conserver la capacité à rejouer un snapshot du site Wix d’origine.

Structure
- scripts/scrape.mjs: script principal Playwright (ESM).
- workflows/scrape.yml: workflow GitHub Actions archivé (désactivé).
- out/: dossiers d’exports éventuellement conservés en référence.

Exécution locale
1) Dans ce dossier: `npm install`
2) Lancer: `npm run scrape`

Docker (Playwright)
- Image de référence: `mcr.microsoft.com/playwright:v1.55.0-jammy`.
- Exemple:
  docker run --rm -it -v "$PWD:/work" -w /work \
    mcr.microsoft.com/playwright:v1.55.0-jammy \
    bash -lc "npm ci && node scripts/scrape.mjs https://www.pozza-maud-psy-angers.com/"

Notes
- Le scraping est archivé et ne s’exécute plus automatiquement.
- Les dépendances sont épinglées pour une reproductibilité minimale.

