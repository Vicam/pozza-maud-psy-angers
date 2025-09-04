# pozza-maud-psy-angers
Use to deploy the website www.pozza-maud-psy-angers.com

## Déploiement Netlify

- Publish directory: `site`
- Build command: (vide) — le site est déjà statique.
- DNS: pointer le domaine vers Netlify (CNAME / A selon configuration).

Scripts utiles:
- `npm run build:site`: génère l’arbo `site/` à partir de `out_manual/*.html` avec réécriture des liens internes.
- `npm run check:links`: valider que les liens internes sont normalisés.
