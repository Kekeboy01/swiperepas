# SwipeRepas 6.0.0 (version de test, dossier /v6/)

Date : 24/11/2026. Version précédente : 5.60.0, qui reste en ligne à la racine. Elle est sauvegardée dans la branche `sauvegarde-5.60.0` et dans le zip sur le PC.

## Principe
- Nouvelle interface posée **par-dessus** le code 5.60.0, dans `js/ui6.js` et `css/ui6.css`.
- `js/app.js` est identique à la 5.60.0, à deux changements près : le chemin des données (`../data/`, partagé avec la racine) et le numéro de version.
- Aucune fonction supprimée. Chaque écran remplacé reste disponible : « Vue complète de la semaine », « Tous les réglages (ancienne page) », « Plus d'actions » sur la fiche.
- Mêmes données que la 5.60.0 : mêmes recettes, même dictionnaire, Ciqual 2020. Le moteur n'a pas été reconstruit.

## Ajouté
- **Palette Terracotta** : #D8613F, #BD4D31, #C94C3B, #FFF8F1, #E5B94B, #68705A, #DFF2F7, #29231F.
- **Accueil** avec 3 actions : Préparer ma semaine, Cuisiner maintenant, Reprendre · Ma semaine. Daily dit « Que faisons-nous aujourd'hui ? ».
- **Navigation** en 5 onglets : Accueil, Semaine, Cuisiner, Courses, Profil. La recherche est dans la loupe en haut, le garde-manger dans le Profil.
- **Profil** en 6 sections repliables : Mon foyer, Mes goûts, Ma semaine habituelle, Mon organisation, Ma cuisine, Mes objectifs · modes.
  - Les réponses de la présentation de Daily (meal prep, objectif) remplissent le profil.
  - « Préparer ma semaine » ne repose plus les questions déjà connues : on arrive directement au récapitulatif.
- **Modes** (règles nouvelles, **à valider**) :
  - Normal : les recettes classiques restent classiques. Rien n'est remplacé, la friteuse est permise.
  - Équilibré : une salade verte est ajoutée aux plats sans légume.
  - Allégé : la version allégée de la recette est appliquée par défaut quand elle existe.
  - Plus protéiné : +25 % sur la protéine principale des plats. Combinable avec les autres modes.
- **Prep meal 6.0** : c'est une option d'organisation, pas un mode. Le parcours :
  1. Swipe d'une grande base, avec 3 idées de plats.
  2. ♥ → « Pour combien de repas veux-tu utiliser cette base ? » : 2 ou 3, rien n'est imposé.
  3. Deuxième base (ou « Pas de deuxième base »).
  4. Swipe des plats des bases.
  5. Swipe des autres plats (libres).
  6. Planning.
  - Si le profil dit Prep meal = NON, aucune question n'est posée.
- **Planning** :
  - Semaine 1 | Semaine 2 : deux plannings séparés, tous les deux enregistrés.
  - Un jour à la fois, avec des onglets Lun…Dim et les vraies dates.
  - Lignes : Midi, Soupe du midi, Soir, Soupe du soir, Dessert, Smoothie, Eau aromatisée, avec ❄️ si le plat se congèle.
  - Une ligne touchée affiche : Ouvrir, Cuisiner, Changer, Déplacer, Supprimer, plus les infos (prep, restes, anti-gaspi, accompagnement, sauce).
- **Fiche recette** :
  - Photo, nom, temps, difficulté, mode.
  - Onglets Ingrédients / Étapes / Nutrition. Les ingrédients sont des lignes « nom · quantité › », et la ligne « Sauce › » permet de la changer.
  - Barre ❄️ Conservation · 📤 Partager · ＋ Ajouter, puis « Commencer à cuisiner ».
- **Substitutions** : les meilleures alternatives sont classées dans l'ordre du moteur, avec un pourcentage d'affichage. Le calcul reste interne.
- **❄️ Conservation** propre à chaque recette : réfrigérateur, congélation, décongélation, réchauffage, priorité.
- **Swipe** : nom, accompagnement, temps, difficulté, mode et « Voir la recette ». La fiche technique (kcal, macros) est déplacée dans la recette.
- **Rappels de Daily**, calculés sur les vraies dates. La semaine préparée commence le lundi qui vient.
  - Jour 1 : rien.
  - Lendemain de la session : « Ton repas est prêt… pense à congeler ».
  - Veille d'un repas congelé : « place ton repas au réfrigérateur ».
  - Avant-dernier jour : « On prépare la suite ? », avec le bouton PRÉPARER LA PROCHAINE SEMAINE.
- **Partage de la semaine** en texte. Les partages de la recette et de la liste sont conservés.
- **Daily** :
  - Nouvelle bibliothèque d'images dans `assets/daily/` : master, 12 tenues, 5 poses.
  - Il ne parle que s'il est utile : il se tait dans la recherche, le garde-manger, le swipe, les courses et le profil, sauf pour une alerte utile.
  - Les thèmes saisonniers ne sont **pas activés**.
- **Service worker** propre à /v6/ (cache `swipe-repas-v6-6000`). Il ne supprime que ses propres caches.

## Corrigé pendant les tests
- La sélection « meal prep : oui » de la présentation n'arrivait pas dans le profil.
- La bulle de la présentation était écrasée (conflit de style). Corrigé.
- L'étiquette « Autres poses utiles » apparaissait sur l'image de Daily qui salue. Corrigé.
- Le nombre de plats de base dépassait le nombre de soirs. Le surplus va maintenant sur les midis.
- Le texte d'accompagnement était redondant (« riz » sous « … riz et poulet ») ou montrait la farine ou la chapelure. Corrigé.

# 6.0.1 (25/11/2026) — version officielle
- Validée par la personne et publiée à la racine. La 5.60.0 est sauvegardée dans la branche `sauvegarde-5.60.0`.
- **Courses, rayon Surgelés** : les surgelés se vendent en paquets, pas à la pièce. Tout est donc converti en **grammes**, arrondis à 10 g au-dessus, avec le poids moyen du produit pris dans le dictionnaire (poids d'une pièce, ou poids du paquet ou de la barquette). Exemple : « carottes (surgelés) 200 g » au lieu de « 2 carottes ».
- L'adresse /v6/ renvoie vers la version officielle et retire son service worker.
