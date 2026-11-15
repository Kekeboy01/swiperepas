# Pipeline Recipe1M+ pour Swipe Repas

1. Obtenir officiellement `layer1.json` et, si souhaité, `layer2.json`/images.
2. Normaliser sans charger tout le catalogue en mémoire si `ijson` est installé :
   `python tools/recipe1m/import_recipe1m.py --layer1 CHEMIN/layer1.json --layer2 CHEMIN/layer2.json --out import/recipe1m/normalized.jsonl --limit 10000`
3. Enrichir les lignes : `title_fr`, `instructions_fr`, `ingredients` avec `name_fr`, `qty`, `unit`, puis temps/nutrition/tags. Les données incertaines ne sont pas publiées.
4. Construire le lot validé :
   `python tools/recipe1m/build_swipe_catalog.py --input import/recipe1m/reviewed.jsonl --out data/recettes-importees.json --quarantine import/recipe1m/quarantine.jsonl`
5. Fusionner sans doublons :
   `python tools/recipe1m/merge_catalog.py --base data/recettes.json --imported data/recettes-importees.json --out data/recettes-next.json`
6. Lancer `audit-quantities.py` avant remplacement du catalogue actif.

Le pipeline sépare volontairement import brut, traduction/enrichissement, quarantaine, audit et publication.
