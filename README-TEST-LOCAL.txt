SWIPE REPAS 5.25.1 - VERSION COMPLETE LOCALE PWA

DEMARRER SUR LE PC
1. Ouvre CMD dans ce dossier.
2. Lance : py -m http.server 8056 --bind 0.0.0.0
3. Sur le PC : http://localhost:8056/?v=5251

TESTER LE SWIPE SUR LE TELEPHONE
1. PC et telephone sur le meme Wi-Fi.
2. Dans un autre CMD, lance : ipconfig
3. Repere l'adresse IPv4 du PC, par exemple 192.168.1.25.
4. Sur le telephone, ouvre http://ADRESSE-IPV4:8056/?v=5251
5. Autorise Python dans le pare-feu Windows si Windows le demande.

PWA
- Le manifeste, le service worker et les icones 192/512 sont inclus.
- Installation testable sur le PC via localhost.
- Sur telephone, l'installation PWA complete doit etre testee depuis la version HTTPS publiee (GitHub Pages), pas depuis l'adresse HTTP locale du PC.
- Si une ancienne PWA est installee, desinstalle-la puis efface les donnees du site avant de tester un nouveau manifeste.

CATALOGUE
Cette archive autonome contient les 20 recettes Wrap/Burrito integrees a l'application. Le fichier data/recettes.json est volontairement vide dans cette archive, car le catalogue complet recettes.json n'etait pas joint aux fichiers transmis. Pour tester avec tout ton catalogue, remplace data/recettes.json par celui de ton dossier GitHub actuel.

MISE A JOUR 5.25.1
- Catalogue complet inclus : 5119 recettes.
- Portions adultes légèrement généreuses normalisées pour une base de 4 personnes.
- Références : viande/volaille 600 g, poisson frais 650 g, pâtes 400 g, riz/céréales 360 g, pommes de terre 1 kg.
- Le calcul proportionnel existant est conservé pour 1 à 12 personnes.

CORRECTIF 5.25.1
- Validation du swipe mobile plus sensible.
- Animation complète avant validation ou refus.

VERSION 5.25.1
- Retour dans le Swipe.
- Liens de recette et liste de courses.
- Bouton changer directement sur image du planning.
- Champ membres du profil famille.

CORRECTIF 5.25.1
- Liste de courses: regroupement synonymes/pluriels, conversion kg-g et l-ml, déduction du stock, classement par rayon.
- Je cuisine maintenant: pénalité des vrais manquants, priorité au stock et accompagnements, substituts visibles directement dans les résultats.

VERSION 5.25.1
- Illustrations contextuelles par famille de recette.
- Rayons de courses retravaillés et testés sur le catalogue.
- Validation du planning vers la liste de courses.
- Ajout direct aux courses disponible depuis Swipe; Recherche conserve son bouton Courses.
- Visual in this file was generated with Microsoft Copilot.

VERSION 5.25.1 GITHUB CANDIDATE
- Priorité d illustrations corrigée selon le type réel de recette.
- Suggestions rapides Allergies / J aime / J évite dans Profil, toujours modifiables.

VERSION 5.25.1 TEST LOCAL - BIBLIOTHEQUE VISUELLE
- 16 visuels précis par combinaison de plat intégrés en priorité avant les catégories génériques.
- Visual in this file was generated with Microsoft Copilot.

VERSION 5.25.1 TEST LOCAL - REGLE SOUPE NEUTRALISEE
- Une image de soupe est autorisee uniquement si le nom ou les tags de la recette indiquent soupe, veloute, potage ou bouillon.
- Les ingredients seuls ne peuvent plus declencher une image de soupe.

VERSION 5.25.1 TEST LOCAL - PRIORITE VISUELLE
- Nature du plat, puis forme de proteine, puis accompagnement.
- Steak, cuisse, boulettes, saucisse, hache, filet et emince passent avant pates/riz/pommes de terre.
- Soupe limitee au nom/tags explicites.

VERSION 5.25.1 TEST PC - FAMILLES VISUELLES STRICTES
- Les images drink/soupe/detox/energy ne peuvent plus servir de secours aux plats solides.
- Les formes steak, cuisse, boulettes, saucisse, hache, filet/escalope, emince/morceaux gardent la priorite avant les accompagnements.
