SWIPE REPAS 5.23.0 - VERSION COMPLETE LOCALE PWA

DEMARRER SUR LE PC
1. Ouvre CMD dans ce dossier.
2. Lance : py -m http.server 8056 --bind 0.0.0.0
3. Sur le PC : http://localhost:8056/?v=5230

TESTER LE SWIPE SUR LE TELEPHONE
1. PC et telephone sur le meme Wi-Fi.
2. Dans un autre CMD, lance : ipconfig
3. Repere l'adresse IPv4 du PC, par exemple 192.168.1.25.
4. Sur le telephone, ouvre http://ADRESSE-IPV4:8056/?v=5230
5. Autorise Python dans le pare-feu Windows si Windows le demande.

PWA
- Le manifeste, le service worker et les icones 192/512 sont inclus.
- Installation testable sur le PC via localhost.
- Sur telephone, l'installation PWA complete doit etre testee depuis la version HTTPS publiee (GitHub Pages), pas depuis l'adresse HTTP locale du PC.
- Si une ancienne PWA est installee, desinstalle-la puis efface les donnees du site avant de tester un nouveau manifeste.

CATALOGUE
Cette archive autonome contient les 20 recettes Wrap/Burrito integrees a l'application. Le fichier data/recettes.json est volontairement vide dans cette archive, car le catalogue complet recettes.json n'etait pas joint aux fichiers transmis. Pour tester avec tout ton catalogue, remplace data/recettes.json par celui de ton dossier GitHub actuel.

MISE A JOUR 5.23.0
- Catalogue complet inclus : 5119 recettes.
- Portions adultes légèrement généreuses normalisées pour une base de 4 personnes.
- Références : viande/volaille 600 g, poisson frais 650 g, pâtes 400 g, riz/céréales 360 g, pommes de terre 1 kg.
- Le calcul proportionnel existant est conservé pour 1 à 12 personnes.
