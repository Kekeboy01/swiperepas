# Tests réels de la 6.0.0 (24/11/2026)

## 1. Parcours automatisés (Node, vrai code app.js + ui6.js, vraies données)
Commande, depuis `v6/` : `STORE=/tmp/s.json node tests/t2.js ./`, puis t3, t4 et t5 dans cet ordre (ils partagent le même stockage). t6 se lance seul.

Résultat : **79 vérifications sur 79 réussies, 0 erreur JavaScript.**

- ✅ premier lancement : présentation Daily
- ✅ fin de présentation → accueil
- ✅ présentation mémorisée
- ✅ accueil : 3 actions + phrase de Daily
- ✅ choix « meal prep : oui » de la présentation → profil Prep meal OUI
- ✅ navigation 5 onglets
- ✅ profil : 6 sections
- ✅ ancienne page profil toujours accessible
- ✅ profil : soirs 5 → 4 enregistré
- ✅ profil : 2 repas par base
- ✅ profil : friteuse cochée
- ✅ profil écrit dans le stockage
- ✅ rechargement : profil conservé, pas de nouvelle présentation
- ✅ Prep meal OUI → parcours prep lancé directement (aucune question)
- ✅ swipe de base : grande base + 3 idées
- ✅ ✕ : base suivante
- ✅ ♥ → « Pour combien de repas veux-tu utiliser cette base ? »
- ✅ choix 2 ou 3 (rien d’imposé)
- ✅ deuxième base proposée (avec sortie possible)
- ✅ après 2 bases → swipe des plats (pas de boucle)
- ✅ 1res phases = plats des bases (3+2 = 5 repas : soirs puis midis)
- ✅ fin du swipe → planning (11 gestes, pas de boucle infinie)
- ✅ soirs 4/4 et midis 5/5 remplis
- ✅ planning : jours en onglets + lignes Midi/Soir
- ✅ pas les 7 jours empilés à l’écran principal
- ✅ rechargement : planning conservé (9 repas)
- ✅ changer de jour
- ✅ ligne de repas : Ouvrir / Cuisiner / Changer / Déplacer / Supprimer
- ✅ déplacer vers un autre jour
- ✅ supprimer un repas
- ✅ ajouter : choix des créneaux (midi, soir, dessert, smoothie, eau…)
- ✅ changer → replaceSwipe
- ✅ ❄️ fiche conservation : Poulet curry coco et courgettes, riz
- ✅ Semaine 2 : planning séparé (vide)
- ✅ onglets Semaine 1 | Semaine 2
- ✅ jour : Dessert, Smoothie, Eau
- ✅ retour Semaine 1 intacte
- ✅ Semaine 2 enregistrée
- ✅ partager la semaine
- ✅ valider → courses
- ✅ liste de courses affichée
- ✅ cocher un article
- ✅ partage de la liste présent
- ✅ veille / jour de la session : aucun rappel (jour 1 = rien)
- ✅ lendemain de la session : « Ton repas est prêt… pense à congeler »
- ✅ veille d’un repas congelé (jour 2) : « place ton repas au réfrigérateur »
- ✅ avant-dernier jour (jour 3) : « On prépare la suite ? »
- ✅ bouton PRÉPARER LA PROCHAINE SEMAINE sur l’accueil
- ✅ fiche : temps, difficulté, mode
- ✅ fiche : ingrédients en lignes cliquables
- ✅ substitutions de « émincé de bœuf » avec %
- ✅ remplacement appliqué, retour à la fiche
- ✅ nouvel ingrédient visible : émincé de poulet
- ✅ sauce : liste des sauces compatibles
- ✅ sauce choisie : Sauce curry au lait de coco
- ✅ onglet Étapes
- ✅ onglet Nutrition (Ciqual 2020)
- ✅ partager la recette
- ✅ ❄️ depuis la fiche
- ✅ mode cuisine ouvert
- ✅ Étape 1 sur N
- ✅ Suivant
- ✅ Précédent
- ✅ minuteur (si l’étape en a un)
- ✅ Cuisiner maintenant ouvert
- ✅ Plus protéiné : poulet 300 g → 375 g (2 pers.)
- ✅ protéines/portion 40 → 49 g
- ✅ Allégé : version allégée appliquée par défaut (Poulet haché, pommes de terre et épinards au paprika)
- ✅ courses : Daily seulement si utile
- ✅ recherche : pas de Daily
- ✅ Prep meal NON → aucune question de prep, récapitulatif de la semaine
- ✅ semaine pré-remplie depuis le profil (3 soirs, 1 dessert)
- ✅ bouton pour lancer le swipe
- ✅ swipe des plats
- ✅ carte swipe : nom, accompagnement, temps, difficulté, mode + Voir la recette
- ✅ pas de fiche technique sur la carte
- ✅ planning après swipe (4 gestes)
- ✅ 3 soirs + 1 dessert placés
- ✅ pas de rappel prep quand Prep meal = NON

## 2. Non-régression du moteur (5.60.0 racine contre 6.0.0, mode Normal, même profil)
Commande : `node tests/nonreg.js`

- ✅ identique — nombre de recettes
- ✅ identique — recettes autorisées (profil test)
- ✅ identique — ingrédients de 400 recettes (4 pers.)
- ✅ identique — nutrition de 400 recettes
- ✅ identique — étapes de 200 recettes
- ✅ identique — substitutions (poulet, riz, courgettes)
- ✅ identique — familles prep meal
- ✅ identique — bases rapides
- ✅ identique — conservation (jours) 400 recettes
- ✅ identique — liste de courses (planning fixe)
- ✅ identique — planning auto (graine fixe)
- 11/11 identiques

La seule différence visible entre les versions est voulue : sur la page des courses, la phrase de Daily n'est plus affichée.

## 3. Vrai navigateur (Google Chrome, écran de téléphone 390×844)
Commande : `python3 tests/navigateur.py` (avec `python3 -m http.server 8765` lancé à la racine du dépôt).

Parcours testé :
- présentation de Daily (meal prep : oui) ;
- accueil ;
- Préparer ma semaine → base 1 → 3 repas → base 2 → 2 repas ;
- swipe des plats jusqu'au planning ;
- ligne de repas, fiche recette, substitution, conservation, mode cuisine ;
- courses, profil, Cuisiner maintenant ;
- rechargement de la page.

Résultat :
- 0 erreur dans la console ;
- planning conservé après rechargement ;
- service worker v6 actif ;
- cache `swipe-repas-v6-6000` seul.

## Non testé ici (à tester sur ton téléphone)
- Le vrai partage Android/iOS (la fenêtre de partage du téléphone). Testé ici en simulation.
- Les notifications de minuteur en arrière-plan.
- L'installation de la version de test comme application.
