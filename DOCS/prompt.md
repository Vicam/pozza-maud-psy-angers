J'essaye de déployer un site web avec Netlify qui utilise Decap CMS.
Cependant le lien d'invitation que je créer avec Netlify Identity ne permet pas à l'utilisateur de créer son mdp pour la section /admin/ du site permettant d'utiliser Decap CMS.
Tu peux vérifier le index.html et config.yml de la section admin pour Decap CMS.
Paramètre Netlify :
Dans Netlify → Identity :
Enabled -> oui
Git Gateway : Enabled -> oui
Registration : “Invite only” recommandé
Tu t’es invité avec ton e-mail, tu utilises cet e-mail pour te connecter. -> oui