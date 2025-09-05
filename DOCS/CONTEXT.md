# Contexte du projet

L'objectif de ce projet est de migrer le site Wix de Maud Pozza, psychologue à Angers, vers un site statique qui sera déployé sur Netlify.

**URL du site original :** https://www.pozza-maud-psy-angers.com/

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