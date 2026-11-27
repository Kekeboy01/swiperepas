/* SwipeRepas 6.2.0 — Profils de départ « Santé & tolérances ».
   Recherche documentaire du 26/11/2026, sources officielles françaises (Assurance Maladie / ameli.fr, Santé.fr,
   SNFGE, sociétés savantes, associations de patients). Chaque aliment est relié à la phrase de la source qui le justifie.

   Règles :
   - Ce sont des RECOMMANDATIONS GÉNÉRALES, pas une prescription. Chaque aliment arrive en « À vérifier pour moi » :
     la personne décide elle-même (et avec son médecin ou diététicien).
   - « suggested » = ce que dit la recommandation générale (LIMIT, AVOID, STRICT_EXCLUSION). Jamais appliqué automatiquement.
   - Seuls des identifiants existants de data/ingredients.json sont utilisés (test automatique t8).
   - Relecture par un professionnel de santé recommandée avant un usage commercial.
*/
(function(root){
'use strict';
const S={
 ameli_rgo:{title:'Assurance Maladie (ameli.fr) — Diagnostic et traitement du RGO de l’adulte',url:'https://www.ameli.fr/assure/sante/themes/rgo-adulte/diagnostic-traitements'},
 ameli_rgo2:{title:'Assurance Maladie (ameli.fr) — Remontées acides et RGO : que faire ?',url:'https://www.ameli.fr/assure/sante/themes/rgo-adulte/que-faire-quand-consulter'},
 sfhgl_rgo:{title:'SFHGL — Le reflux gastro-œsophagien, fiche de recommandations alimentaires (mai 2026)',url:'https://www.sfhgl.org/wordpress/wp-content/uploads/2026/06/fiche-recommandations-rgo-sfhgl.pdf'},
 ameli_diab:{title:'Assurance Maladie (ameli.fr) — Diabète et alimentation au quotidien : les fondamentaux',url:'https://www.ameli.fr/assure/sante/themes/diabete-adulte/diabete-vivre-quotidien/equilibre-alimentaire/diabete-alimentation-fondamentaux'},
 ameli_diab2:{title:'Assurance Maladie (ameli.fr) — Prise en charge non médicamenteuse du diabète de type 2',url:'https://www.ameli.fr/assure/sante/themes/diabete-adulte/diabete-traitement/traitements-non-medicamenteux'},
 ameli_dt1:{title:'Assurance Maladie (ameli.fr) — Enfant et adolescent diabétiques : la vie au quotidien',url:'https://www.ameli.fr/assure/sante/themes/diabete-type-1-enfant-adolescent/vie-quotidienne'},
 ffd_boissons:{title:'Fédération Française des Diabétiques — Les boissons',url:'https://planalimentaire.federationdesdiabetiques.org/familles-aliment/les-boissons/'},
 ameli_crohn:{title:'Assurance Maladie (ameli.fr) — Suivi médical et vie quotidienne, maladie de Crohn',url:'https://www.ameli.fr/assure/sante/themes/maladie-crohn/suivi-medical-vie-quotidienne'},
 ameli_rch:{title:'Assurance Maladie (ameli.fr) — Suivi médical et vie quotidienne, rectocolite hémorragique',url:'https://www.ameli.fr/assure/sante/themes/rectocolite-hemorragique/suivi-medical-vie-quotidienne'},
 afa_poussee:{title:'Afa Crohn RCH France — Manger en période de poussée (recommandations HAS)',url:'https://www.afa.asso.fr/alimentation-et-mici/adapter-son-alimentation/manger-poussee/'},
 santefr_fodmap:{title:'Santé.fr — Le régime pauvre en FODMAP est-il efficace en cas d’intestin irritable ? (2026)',url:'https://www.sante.fr/decryptage/nos-reponses/le-regime-pauvre-en-fodmap-est-il-efficace-en-cas-dintestin-irritable'},
 ameli_gluten:{title:'Assurance Maladie (ameli.fr) — Régime alimentaire sans gluten en cas de maladie cœliaque',url:'https://www.ameli.fr/assure/sante/themes/intolerance-gluten-maladie-coeliaque/regime-alimentaire'},
 snfge_gluten:{title:'SNFGE — Régime sans gluten (fiche médecins)',url:'https://www.snfge.org/sites/www.snfge.org/files/recommandations/regime_sans_gluten_0.pdf'},
 afdiag:{title:'AFDIAG — Association Française Des Intolérants Au Gluten',url:'https://afdiag.fr/fr/actualites/articles/tout-savoir-sur-le-gluten'},
 ameli_lactose:{title:'Assurance Maladie (ameli.fr) — Intolérance au lactose : quel régime alimentaire ?',url:'https://www.ameli.fr/assure/sante/themes/intolerance-lactose/alimentation-evolution'},
 ameli_hta:{title:'Assurance Maladie (ameli.fr) — Quelle alimentation en cas d’hypertension artérielle ?',url:'https://www.ameli.fr/assure/sante/themes/hypertension-arterielle-hta/alimentation-et-hta'},
 ameli_chol:{title:'Assurance Maladie (ameli.fr) — Cholestérol et/ou triglycérides élevés : quel traitement ?',url:'https://www.ameli.fr/assure/sante/themes/trop-cholesterol-triglycerides-dans-sang-dyslipidemie/traitement'},
 ameli_ag:{title:'Assurance Maladie (ameli.fr) — Lipides, acides gras et omégas 3 dans l’alimentation',url:'https://www.ameli.fr/assure/sante/themes/alimentation/omegas-3/lipides-acides-gras-et-omegas-3-dans-l-alimentation-de-quoi-parle-t'},
 ameli_goutte:{title:'Assurance Maladie (ameli.fr) — Traitement de la goutte',url:'https://www.ameli.fr/assure/sante/themes/goutte/traitement'},
 ameli_ulcere:{title:'Assurance Maladie (ameli.fr) — L’ulcère de l’estomac ou du duodénum au quotidien',url:'https://www.ameli.fr/assure/sante/themes/ulcere-estomac-duodenum/vivre-quotidien-ulcere-estomac-duodenum'},
 ameli_dyspepsie:{title:'Assurance Maladie (ameli.fr) — Dyspepsie ou mauvaise digestion : que faire ?',url:'https://www.ameli.fr/rhone/assure/sante/themes/dyspepsie-mauvaise-digestion/consulter-agir-dyspepsie-mauvaise-digestion'},
 ameli_irc:{title:'Assurance Maladie (ameli.fr) — Maladie rénale chronique : prise en charge',url:'https://www.ameli.fr/medecin/sante-prevention/sante-cardiovasculaire/maladies-cardiovasculaires-et-associees/maladie-renale-chronique'},
 has_endo:{title:'HAS / CNGOF — Prise en charge de l’endométriose (2017)',url:'https://www.has-sante.fr/jcms/c_2819733/fr/prise-en-charge-de-l-endometriose'}
};
const L='LIMIT',A='AVOID',X='STRICT_EXCLUSION';
const many=(ids,sug,why)=>ids.map(id=>[id,sug,why]);
const T={};
/* ---- Reflux gastro-œsophagien ---- */
T.reflux={label:'Reflux gastro-œsophagien',sources:['ameli_rgo','ameli_rgo2','sfhgl_rgo'],
 note:'Repérez les aliments qui déclenchent VOS brûlures pour en consommer moins : tout le monde ne réagit pas aux mêmes. Les mesures les plus efficaces ne sont pas alimentaires : surélever la tête du lit, attendre 2 à 3 h entre le repas et le coucher, perdre du poids si besoin.',
 foods:[...many(['tomates','tomates concassées','concentré de tomate','ketchup'],L,'Tomate et jus de tomate : à limiter, ou à éviter s’ils déclenchent des symptômes (ameli, SFHGL).'),
  ...many(['jus d’orange','citron','citrons','citron vert'],L,'Jus d’orange et citron : à limiter (ameli).'),
  ...many(['vinaigre de vin','vinaigre de cidre','vinaigre balsamique'],L,'Vinaigre : à limiter (ameli).'),
  ...many(['vin blanc','vin rouge','bière brune'],L,'Alcool : à limiter (ameli).'),
  ...many(['chocolat','chocolat noir'],L,'Chocolat : à éviter s’il déclenche des symptômes (SFHGL).'),
  ...many(['piment','curry'],L,'Épices : à éviter si elles déclenchent des symptômes (ameli, SFHGL).'),
  ...many(['lardons','chorizo','merguez','chipolatas de porc'],L,'Charcuterie et aliments gras : à éviter en excès (SFHGL) ; les corps gras augmentent les symptômes (ameli).'),
  ...many(['crème fraîche','beurre'],L,'Corps gras à diminuer : ils ralentissent la vidange de l’estomac (ameli).'),
  ['pâte à pizza',L,'Pizzas : à éviter si elles déclenchent des symptômes (SFHGL).']]};
/* ---- Diabètes ---- */
const SUCRES=[...many(['sucre','sucre roux','sucre vanillé','miel'],L,'Produits sucrés : à limiter ; aucun aliment n’est interdit (ameli).'),
 ...many(['chocolat','chocolat noir'],L,'Produits sucrés et gras : à consommer avec modération (ameli).'),
 ['jus d’orange',A,'Boissons sucrées, y compris les jus 100 % pur jus : à éviter (Fédération Française des Diabétiques).']];
T.diabete_2={label:'Diabète de type 2',sources:['ameli_diab','ameli_diab2','ffd_boissons'],
 note:'Il n’existe plus de « régime diabétique » : alimentation variée, sans aliment interdit, en limitant les produits sucrés, salés et gras. Gardez toujours de quoi corriger une hypoglycémie si votre traitement peut en provoquer (ex. 3 morceaux de sucre).',foods:SUCRES};
T.prediabete={label:'Prédiabète',sources:['ameli_diab','ffd_boissons'],
 note:'Mêmes repères que pour le diabète de type 2 : alimentation équilibrée, produits sucrés limités. À adapter avec votre médecin.',foods:SUCRES};
T.diabete_1={label:'Diabète de type 1',sources:['ameli_dt1','ameli_diab'],
 note:'Les glucides de chaque repas sont à adapter avec votre traitement et votre équipe soignante. Le sucre reste indispensable pour corriger une hypoglycémie : ne l’excluez jamais complètement.',
 foods:[...many(['sucre','sucre roux','sucre vanillé','miel','chocolat','chocolat noir'],L,'Sucreries : à éviter au quotidien ; à garder pour corriger une hypoglycémie (ameli).'),['jus d’orange',L,'Jus de fruits : sucres rapides, à réserver à la correction d’une hypoglycémie (ameli).']]};
/* ---- MICI : seulement pendant les poussées ---- */
const MICI_FOODS=[...many(['lentilles corail','lentilles cuites','lentilles vertes','pois chiches','haricots rouges','haricots rouges en boîte','pois cassés','petits pois'],L,'Pendant une poussée seulement : aliments riches en fibres (lentilles, pois chiches…) à éviter provisoirement (ameli).'),
 ...many(['salade','laitue','mesclun','salade romaine','concombre'],L,'Pendant une poussée seulement : légumes et fruits crus exclus provisoirement (ameli).'),
 ...many(['flocons d’avoine','avoine'],L,'Pendant une poussée seulement : céréales complètes exclues provisoirement (ameli).')];
const MICI_NOTE='Hors poussée : aucun régime particulier, l’alimentation doit rester variée et équilibrée (HAS, ameli). Pendant une poussée marquée, un régime pauvre en fibres peut être conseillé provisoirement, avec votre médecin ou diététicien. Après la poussée, repassez ces aliments en « Je tolère ».';
T.crohn={label:'Maladie de Crohn',sources:['ameli_crohn','afa_poussee'],note:MICI_NOTE,foods:MICI_FOODS};
T.rch={label:'Rectocolite hémorragique',sources:['ameli_rch','afa_poussee'],note:MICI_NOTE,foods:MICI_FOODS};
T.mici_autre={label:'Autre MICI',sources:['afa_poussee','ameli_crohn'],note:MICI_NOTE,foods:MICI_FOODS};
/* ---- Syndrome de l'intestin irritable : FODMAP, temporaire et encadré ---- */
T.sii={label:'Syndrome de l’intestin irritable',sources:['santefr_fodmap'],
 note:'Le régime pauvre en FODMAP se fait avec un diététicien ou un médecin : suppression 4 à 6 semaines maximum, puis réintroduction aliment par aliment. Seuls les aliments vraiment mal tolérés restent exclus. Il n’est pas fait pour durer.',
 foods:[...many(['oignon','oignons rouges','échalote','ail','poireaux'],L,'Riches en FODMAP (fructanes) : oignon, ail, échalote, poireau (Santé.fr).'),
  ...many(['champignons de Paris','avocat'],L,'Riches en FODMAP (polyols) : champignons, avocat (Santé.fr).'),
  ...many(['lentilles corail','lentilles cuites','lentilles vertes','pois chiches','haricots rouges','haricots rouges en boîte','pois cassés'],L,'Riches en FODMAP : légumes secs (Santé.fr).'),
  ...many(['pommes','poires','cerises'],L,'Fruits riches en FODMAP : pomme, poire, cerise (Santé.fr).'),
  ['miel',L,'Riche en fructose : miel (Santé.fr).'],
  ...many(['lait','lait demi-écrémé','crème fraîche','crème liquide','crème légère','yaourt'],L,'Riches en lactose : lait, crème, yaourt (Santé.fr). Beurre et fromages sont des alternatives pauvres en FODMAP.'),
  ...many(['pâtes','pain','pain de mie','farine','semoule','tortillas','pâte à pizza','feuilles de lasagne','chapelure'],L,'Céréales riches en FODMAP : blé, seigle, orge (Santé.fr). Riz, maïs, quinoa, avoine sont des alternatives.')]};
/* ---- Maladie cœliaque : sans gluten strict et à vie ---- */
T.coeliaque={label:'Maladie cœliaque',sources:['ameli_gluten','snfge_gluten','afdiag'],
 note:'Le régime sans gluten strict et à vie est le seul traitement. Le gluten se cache aussi dans des produits transformés (bouillons cubes, saucisses, sauces…) : vérifiez toujours l’étiquette. Les aliments de l’app marqués « gluten » sont proposés ci-dessous.',
 foods:[...many(['pâtes','pain','pain de mie','farine','semoule','tortillas','pâte à pizza','feuilles de lasagne','chapelure'],X,'Blé (y compris épeautre, kamut), orge, seigle : à exclure (ameli, SNFGE).'),
  ['sauce soja',X,'Sauces soja et tamari : à exclure (ameli).'],['bière brune',X,'Toutes les bières : à exclure (ameli).'],
  ...many(['avoine','flocons d’avoine'],'UNKNOWN','Avoine : non contre-indiquée selon la SNFGE si elle est garantie sans gluten ; l’AFDIAG la déconseille en France à cause des contaminations. À décider avec votre médecin.'),
  ...many(['bouillon de légumes','bouillon de volaille'],'UNKNOWN','Bouillon cube : peut contenir du gluten, vérifiez l’étiquette (SNFGE).')]};
/* ---- Intolérance au lactose : adapter à sa tolérance ---- */
T.intol_lactose={label:'Intolérance au lactose',sources:['ameli_lactose'],
 note:'On ne supprime pas les produits laitiers : on les adapte à sa propre tolérance (le calcium reste important). Le yaourt est souvent bien toléré ; les fromages à pâte dure contiennent peu de lactose.',
 foods:[...many(['lait','lait demi-écrémé','crème fraîche','crème liquide','crème légère','fromage blanc'],L,'Lait et produits laitiers riches en lactose : à adapter à votre seuil de tolérance (ameli).'),
  ...many(['yaourt','yaourt grec'],'UNKNOWN','Le yaourt est souvent bien toléré (ameli).')]};
/* ---- Hypertension : moins de sel ---- */
T.hypertension={label:'Hypertension artérielle',sources:['ameli_hta'],
 note:'Objectif : moins de 5 g de sel par jour. 80 % du sel est déjà dans les aliments (pain, fromage, charcuterie, plats préparés). Herbes, épices, citron donnent du goût sans sel.',
 foods:[['sel',L,'Sel : moins de 5 g par jour ; ne pas resaler (ameli).'],
  ...many(['bouillon de légumes','bouillon de volaille','sauce soja','ketchup','moutarde'],L,'Sauces toutes préparées, moutarde, préparations industrielles : souvent riches en sel (ameli).'),
  ...many(['lardons','chorizo','jambon blanc','jambon de dinde','merguez','chipolatas de porc','saucisses de bœuf','saucisses de dinde','saucisses de poulet'],L,'Charcuteries : souvent riches en sel (ameli).'),
  ...many(['feta','roquefort','parmesan','gruyère râpé','reblochon','mozzarella'],L,'Fromages : souvent riches en sel (ameli).'),
  ...many(['pain','pain de mie'],L,'Pain : une des premières sources de sel (ameli).')]};
/* ---- Cholestérol : moins de graisses saturées ---- */
T.cholesterol={label:'Cholestérol élevé',sources:['ameli_chol','ameli_ag'],
 note:'Réduire les graisses saturées (beurre, crème, fromage, charcuterie, viandes grasses) et préférer les huiles végétales (olive, colza, noix). Les laitages allégés (yaourt, fromage blanc) restent possibles.',
 foods:[...many(['beurre','crème fraîche','crème liquide'],L,'Beurre, crème : riches en acides gras saturés (ameli).'),
  ...many(['gruyère râpé','parmesan','reblochon','roquefort','feta','mozzarella'],L,'Fromages : riches en acides gras saturés (ameli).'),
  ...many(['lardons','chorizo','merguez','chipolatas de porc','saucisses de bœuf'],L,'Charcuterie et produits carnés gras : riches en acides gras saturés (ameli).'),
  ['lait de coco',L,'Graisse de coco (coprah) : acides gras saturés d’origine végétale (ameli).']]};
/* ---- Goutte ---- */
T.goutte={label:'Goutte',sources:['ameli_goutte'],
 note:'Réduire viandes, abats, poissons et fruits de mer (riches en purines), arrêter la bière et les sodas sucrés. Les purines des légumes secs (lentilles, haricots, pois) ne posent pas de problème. Laitages allégés, café et cerises sont plutôt favorables.',
 foods:[['bière brune',A,'Bière : à arrêter, même sans alcool (ameli).'],['jus d’orange',A,'Sodas sucrés et jus de fruits riches en fructose : à ne plus consommer (ameli).'],
  ...many(['vin blanc','vin rouge'],L,'Boissons alcoolisées : à diminuer (ameli).'),
  ...many(['bœuf haché','bœuf à braiser','bœuf émincé','émincé de bœuf','steak de bœuf','steak de veau','blanquette de veau','côte de porc','morceaux de porc','porc haché','saucisses de bœuf'],L,'Viande : riche en purines, à réduire en préférant la viande maigre (ameli).'),
  ...many(['anchois','thon','thon en conserve','saumon','pavés de saumon','truite','cabillaud','filets de poisson'],L,'Poissons et fruits de mer : riches en purines, à réduire (ameli).')]};
/* ---- Ulcère / dyspepsie ---- */
T.ulcere={label:'Ulcère de l’estomac ou du duodénum',sources:['ameli_ulcere'],
 note:'Pendant le traitement seulement : aliments faciles à digérer, sans alcool, ni aliments acides ou épicés. Après la cicatrisation, aucun régime n’est nécessaire.',
 foods:[...many(['vin blanc','vin rouge','bière brune'],A,'Boissons alcoolisées : à supprimer pendant le traitement (ameli).'),
  ...many(['citron','citrons','citron vert','jus d’orange','vinaigre de vin','vinaigre de cidre','vinaigre balsamique'],L,'Aliments acides : à supprimer pendant le traitement (ameli).'),
  ...many(['piment','curry'],L,'Aliments épicés : à supprimer pendant le traitement (ameli).')]};
T.dyspepsie={label:'Dyspepsie (mauvaise digestion)',sources:['ameli_dyspepsie'],
 note:'Limiter les aliments gras, acides, épicés et ceux qui gonflent l’estomac, ainsi que ceux qui semblent déclencher vos troubles.',
 foods:[...many(['lardons','chorizo','merguez','chipolatas de porc','crème fraîche'],L,'Aliments gras (graisses cuites, fritures, charcuterie) : ralentissent la vidange de l’estomac (ameli).'),
  ...many(['piment','curry','citron','jus d’orange','vinaigre de vin'],L,'Aliments acides et épicés : augmentent la sensibilité de l’estomac (ameli).'),
  ...many(['lentilles cuites','lentilles vertes','pois chiches','haricots rouges'],L,'Aliments riches en fibres : favorisent la distension de l’estomac (ameli).')]};
/* ---- Situations sans liste d'aliments (information seulement) ---- */
const INFO={
 endometriose:{text:'La HAS (2017) indique que les données sont insuffisantes pour recommander un régime alimentaire en cas d’endométriose. Aucun aliment n’est donc proposé : ajoutez seulement ceux que vous tolérez mal, ou les consignes de votre médecin.',sources:['has_endo']},
 allergie_alim:{text:'Les allergies se règlent dans Profil → Mon foyer → Allergies : elles sont déjà reliées aux 14 allergènes de l’app et retirent les recettes concernées. Ici, vous pouvez ajouter un aliment précis en « Exclusion stricte » avec l’origine « Allergie ».',sources:[]},
 intol_fructose:{text:'Il existe deux situations très différentes (intolérance héréditaire, malabsorption). La liste d’aliments dépend du diagnostic : ajoutez celle donnée par votre médecin ou diététicien.',sources:[]},
 intol_autre:{text:'Ajoutez les aliments que vous tolérez mal, ou ceux indiqués par votre médecin.',sources:[]},
 irc:{text:'En cas de maladie rénale chronique, le sel est limité (6 à 8 g maximum par jour, objectif moins de 5 g) et les protéines sont adaptées selon le stade. Ces apports sont individuels : suivez les consignes de votre néphrologue ou diététicien.',sources:['ameli_irc']}
};
const DATA={version:'SANTE_TEMPLATES_1.0',checked:'2026-11-26',verification:'Recherche documentaire sur sources officielles (26/11/2026). Relecture par un professionnel de santé recommandée.',sources:S,templates:T,info:INFO};
if(typeof module!=='undefined'&&module.exports)module.exports=DATA;
root.SRHealthData=DATA;
})(typeof window!=='undefined'?window:globalThis);
