// Fiche Santé — tests du noyau (sans interface), sur les vraies données de l'app.
const C=require('../js/health.js'),fs=require('fs'),path=require('path');
const base=process.argv[2]||'./';const ING=JSON.parse(fs.readFileSync(path.join(base,'data/ingredients.json'),'utf8')).ingredients;
const REC=JSON.parse(fs.readFileSync(path.join(base,'data/recettes.json'),'utf8'));
let n=0,f=0;const ok=(c,m)=>{n++;if(!c)f++;console.log((c?'✅ ':'❌ ')+m)};
// 1. Aucune recommandation médicale inventée
const D=require('../js/health-templates.js');
ok(Object.keys(C.TEMPLATES).length===15&&C.CONDITIONS.filter(c=>c.templateStatus==='VERIFIED_TEMPLATE').every(c=>C.TEMPLATES[c.templateId]),'15 profils sourcés reliés à leur situation');
ok(Object.values(D.templates).every(t=>t.sources.length&&t.sources.every(k=>D.sources[k]&&/^https:\/\//.test(D.sources[k].url))),'chaque profil cite au moins une source officielle (lien https)');
ok(Object.values(D.templates).every(t=>t.foods.every(f=>f[0] in ING&&f[2]&&f[2].length>10)),'chaque aliment proposé existe dans la base et a sa justification');
ok(Object.values(D.templates).every(t=>t.foods.every(f=>['LIMIT','AVOID','STRICT_EXCLUSION','UNKNOWN'].includes(f[1]))),'suggestions = statuts valides');
ok(['endometriose','allergie_alim','intol_fructose','intol_autre','irc'].every(id=>{const c=C.CONDITIONS.find(x=>x.id===id);return c&&c.templateStatus==='MANUAL_ONLY'&&c.info}),'situations sans liste d’aliments : MANUAL_ONLY + information (ex. endométriose : pas de régime recommandé par la HAS)');
ok(C.TEMPLATES.coeliaque.items.filter(i=>i.suggested==='STRICT_EXCLUSION').every(i=>(ING[i.id].al||[]).includes('gluten')),'cœliaque : exclusions strictes = aliments marqués gluten dans la base');
ok(C.searchConditions('cro').some(c=>c.id==='crohn')&&C.searchConditions('mici').length>=3&&C.searchConditions('r').length===0,'recherche de situation (après 2 lettres)');
ok(C.searchConditions('diab').length===3&&C.searchConditions('reflux')[0].id==='reflux','recherche : diabète, reflux');
ok(C.DEMO_FOODS.every(k=>k in ING),'les aliments de démo existent dans la base');
// 2. Ajout d'aliments : seulement des identifiants existants
let h=C.emptyHealth();
ok(C.addFood(h,'aliment_invente',ING).reason==='REVIEW:aliment_inconnu','identifiant inconnu → REVIEW, rien d\'inventé');
let r=C.addFood(h,'tomates',ING).rule;
ok(r.status==='UNKNOWN'&&r.origin==='PERSONAL_TOLERANCE'&&!r.modifiedByUser,'nouvel aliment : « À vérifier pour moi », origine non médicale');
ok(C.addFood(h,'tomates',ING).reason==='deja_present','pas de doublon');
ok(C.addCondition(h,C.CONDITIONS.find(c=>c.id==='crohn'))&&h.foodRules.length===1,'ajouter une situation n\'ajoute AUCUN aliment automatiquement');
ok(!C.addCondition(h,C.CONDITIONS.find(c=>c.id==='crohn')),'situation sans doublon');
const cc=C.customCondition('Ma situation à moi');ok(cc.templateStatus==='MANUAL_ONLY'&&C.addCondition(h,cc),'situation personnelle libre');
ok(C.removeCondition(h,'crohn')&&!h.conditions.some(c=>c.conditionId==='crohn'),'situation retirable');
// 3. Profils préétablis : seulement si vérifiés, jamais d'écrasement
ok(!C.loadTemplate(h,'x',ING).ok,'profil absent → refusé (REVIEW)');
const T={rev:{status:'REVIEW_TEMPLATE',foods:['ail']},ver:{status:'VERIFIED_TEMPLATE',foods:['tomates','ail','inconnu_xyz']}};
ok(C.loadTemplate(h,'rev',ING,T).reason==='REVIEW:profil_non_verifie'&&!C.ruleOf(h,'ail'),'profil en vérification → rien n\'est chargé');
C.setStatus(r,'TOLERATED');
const lt=C.loadTemplate(h,'ver',ING,T);
ok(lt.ok&&lt.added.join()==='ail'&&lt.skipped.includes('tomates')&&lt.skipped.includes('inconnu_xyz'),'profil vérifié : ajoute seulement les nouveaux, ignore les inconnus');
ok(C.ruleOf(h,'tomates').status==='TOLERATED','la recommandation n\'écrase pas le choix de l\'utilisateur');
const ail=C.ruleOf(h,'ail');ok(ail.status==='UNKNOWN'&&ail.origin==='GENERAL_TEMPLATE','élément de profil général arrive en « À vérifier pour moi », jamais en interdit');
C.setStatus(ail,'AVOID');C.setOrigin(ail,'MEDICAL_INSTRUCTION');ok(ail.modifiedByUser&&ail.confirmedByUser,'modification marquée « par l\'utilisateur »');
ok(C.resetToTemplate(ail)&&ail.status==='UNKNOWN'&&ail.origin==='GENERAL_TEMPLATE'&&!ail.modifiedByUser,'« Rétablir la proposition initiale »');
// 4. Statuts, origines, fréquences : tout modifiable
for(const s of C.STATUSES)C.setStatus(r,s);ok(r.status==='STRICT_EXCLUSION','les 5 statuts sont réglables');
for(const o of C.ORIGINS)C.setOrigin(r,o);ok(r.origin==='OTHER','les 6 origines sont réglables');
ok(!C.setStatus(r,'INTERDIT')&&!C.setOrigin(r,'X'),'valeurs invalides refusées');
C.setStatus(r,'LIMIT');ok(C.setFrequency(r,{period:'week',maxOccurrences:2,mode:'max'})&&r.frequency.maxOccurrences===2,'fréquence max 2/semaine');
ok(!C.setFrequency(r,{maxOccurrences:-1})&&!C.setFrequency(r,{maxOccurrences:1.5}),'fréquence invalide refusée');
C.setFrequency(r,{period:'month',maxOccurrences:4,mode:'max'});ok(r.frequency.period==='month','structure prévue pour d\'autres périodes');
C.setStatus(r,'TOLERATED');ok(r.frequency===null,'passer en « Je tolère » efface la fréquence');
// 5. Allergie ≠ préférence ; protection des exclusions strictes médicales
const a=C.newRule?null:null;let h2=C.emptyHealth();const pea=C.addFood(h2,'cacahuètes' in ING?'cacahuètes':Object.keys(ING).find(k=>/arachide|cacahu/.test(k))||'amandes',ING).rule;
C.setStatus(pea,'STRICT_EXCLUSION');C.setOrigin(pea,'ALLERGY');
const pref=C.addFood(h2,'olives noires',ING).rule;C.setStatus(pref,'AVOID');C.setOrigin(pref,'PERSONAL_PREFERENCE');
ok(pea.origin!==pref.origin&&pea.status!==pref.status,'allergie et préférence restent distinctes dans les données');
ok(C.needsConfirm(pea,{status:'AVOID'})&&C.needsConfirm(pea,'delete')&&C.needsConfirm(pea,{origin:'OTHER'})&&!C.needsConfirm(pea,{status:'STRICT_EXCLUSION'}),'assouplir une allergie stricte demande confirmation');
ok(!C.needsConfirm(pref,'delete'),'une préférence se retire sans confirmation');
// 6. Moteur : décisions
const R=(names)=>['🍽','Test',20,'diner',names.map(x=>x+';100;g;E').join('|'),'',0,0,0,0,0,{}];
let h3=C.emptyHealth();const tom=C.addFood(h3,'tomates',ING).rule,oi=C.addFood(h3,'oignon',ING).rule,ai=C.addFood(h3,'ail',ING).rule;
const rT=R(['tomates','riz']),rO=R(['oignon']),rA=R(['ail']),rN=R(['riz']);const recipes=[rT,rO,rA,rN];
ok(C.decide(rT,h3).action==='ok','« À vérifier pour moi » : fonctionnement normal');
C.setStatus(oi,'STRICT_EXCLUSION');ok(C.decide(rO,h3).action==='exclude'&&C.strictHit(rO,h3),'exclusion stricte → exclu');
C.setStatus(tom,'LIMIT');C.setFrequency(tom,{period:'week',maxOccurrences:1,mode:'max'});
ok(C.decide(rT,h3,{selected:[],recipes}).action==='ok','LIMIT 1/sem : proposé tant que non choisi');
ok(C.decide(rT,h3,{selected:[{id:0}],recipes}).action==='exclude','LIMIT 1/sem : retiré après 1 choix cette semaine');
C.setFrequency(tom,{period:'week',maxOccurrences:0,mode:'max'});ok(C.decide(rT,h3,{selected:[],recipes}).action==='exclude','fréquence « Jamais » → retiré');
C.setFrequency(tom,{period:'week',maxOccurrences:null,mode:'spread'});ok(C.decide(rT,h3,{selected:[],recipes}).action==='ok'&&C.decide(rT,h3,{selected:[{id:0}],recipes}).action==='downrank','« espacer » : baisse après un choix');
C.setStatus(ai,'AVOID');const dA=C.decide(rA,h3);ok(dA.action==='downrank'&&dA.weight<=.15,'AVOID : très forte baisse, pas une interdiction');
C.setFrequency(ai,{period:'week',maxOccurrences:2,mode:'max'});ok(C.decide(rA,h3,{selected:[{id:2,rep:2}],recipes}).action==='exclude','AVOID + max 2 : retiré au-delà (portions répétées comptées)');
const mix=R(['oignon','ail']);ok(C.decide(mix,h3).reasons[0].id==='oignon','priorité : exclusion stricte avant « à éviter »');
// 7. Pile du swipe et diversification
C.setFrequency(ai,null);const pool=[rA,rT,rO,rN];
const p0=C.applyPool(pool,h3,{selected:[],recipes},()=>0),p1=C.applyPool(pool,h3,{selected:[],recipes},()=>.99);
ok(!p0.includes(rO)&&p0[p0.length-1]===rA,'pile : exclus retirés, « à éviter » en fin de pile');
ok(p1.includes(rN)&&!p1.includes(rA),'pile : la plupart des « à éviter » laissent la place à d\'autres plats');
h3.enabled=false;ok(C.applyPool(pool,h3,{},()=>0)===pool&&!C.strictHit(rO,h3),'fiche désactivée → aucun effet');h3.enabled=true;
// 8. Apprentissage : jamais silencieux
const before=JSON.stringify(h3.foodRules.map(x=>[x.status,x.origin]));
for(let i=0;i<3;i++)C.onAccept(rA,h3);
ok(JSON.stringify(h3.foodRules.map(x=>[x.status,x.origin]))===before,'accepter des plats ne modifie pas le profil');
ok(C.pending(h3).map(x=>x.foodOrFamilyId).join()==='ail','après 3 acceptations : question posée');
C.answerLater(ai);ok(C.pending(h3).length===0&&C.pending(h3,Date.now()+8*864e5).length===1,'« Me redemander plus tard » : 7 jours');
C.answerKeep(ai);ok(C.pending(h3,Date.now()+8*864e5).length===0&&ai.status==='AVOID','« Non, conserver » : réglage gardé');
// 9. Vraies recettes
let unknown=0;for(const x of REC)for(const k of C.recipeFoods(x).foods)if(!(k in ING))unknown++;
ok(unknown===0,'tous les ingrédients des recettes sont des identifiants de la base ('+REC.length+' recettes)');
const gen=REC.filter(x=>C.recipeFoods(x).unresolved).length;ok(gen>0,gen+' recettes à ingrédients génériques signalées « non résolues » (rien d\'inventé)');
let h4=C.emptyHealth();C.setStatus(C.addFood(h4,'tomates',ING).rule,'STRICT_EXCLUSION');
const withT=REC.filter(x=>C.recipeFoods(x).foods.includes('tomates')).length,kept=C.applyPool(REC,h4,{},()=>0);
ok(withT>0&&kept.length===REC.length-withT&&!kept.some(x=>C.recipeFoods(x).foods.includes('tomates')),'exclure « tomates » retire les '+withT+' recettes qui en contiennent, et seulement elles');
ok(REC.some(x=>/tomate/.test(x[4])&&!C.recipeFoods(x).foods.includes('tomates')),'« concentré de tomate » / « tomates concassées » restent distincts (pas de famille inventée)');

// 10. Profils sourcés : chargement, suggestions jamais appliquées seules, pause, retrait
(()=>{let h=C.emptyHealth();C.addCondition(h,C.CONDITIONS.find(c=>c.id==='reflux'));
 const mine=C.addFood(h,'tomates',ING).rule;C.setStatus(mine,'TOLERATED');
 const r=C.loadTemplate(h,'reflux',ING);
 ok(r.ok&&r.added.length===C.TEMPLATES.reflux.foods.length-1,'reflux : '+r.added.length+' aliments ajoutés');
 ok(h.foodRules.filter(x=>x.templateId==='reflux').every(x=>x.status==='UNKNOWN'&&x.origin==='GENERAL_TEMPLATE'),'tous arrivent en « À vérifier pour moi »');
 ok(mine.status==='TOLERATED'&&mine.refs.some(x=>x.templateId==='reflux'),'« tomates » déjà réglé par l’utilisateur : conservé, recommandation seulement jointe');
 const vin=C.ruleOf(h,'vin rouge');ok(C.suggestionOf(vin).suggested==='LIMIT'&&C.decide(['','',0,'','vin rouge;10;cl'],h).action==='ok','suggestion affichée mais sans effet tant que l’utilisateur ne décide pas');
 ok(C.applySuggestion(vin)&&vin.status==='LIMIT','« Suivre la recommandation » : appliqué sur geste de l’utilisateur');
 C.addCondition(h,C.CONDITIONS.find(c=>c.id==='goutte'));C.loadTemplate(h,'goutte',ING);
 const v2=C.ruleOf(h,'vin rouge');ok(v2.refs.length===2&&v2.status==='LIMIT','aliment commun à 2 profils : une seule règle, 2 recommandations');
 const biere=C.ruleOf(h,'bière brune');ok(C.suggestionOf(biere).suggested==='AVOID','plusieurs profils : la suggestion la plus prudente est montrée');
 C.applySuggestion(biere);const rec=['','',0,'','bière brune;33;cl'];ok(C.decide(rec,h).action==='downrank','bière « à éviter » appliquée');
 h.conditions.find(c=>c.conditionId==='reflux').enabled=false;h.conditions.find(c=>c.conditionId==='goutte').enabled=false;
 ok(C.decide(rec,h).action==='ok'&&!C.ruleActive(biere,h),'situations en pause : leurs aliments « profil général » ne comptent plus');
 C.setOrigin(biere,'PERSONAL_TOLERANCE');ok(C.decide(rec,h).action==='downrank','… sauf si l’utilisateur en a fait sa propre règle');
 h.conditions.forEach(c=>c.enabled=true);
 const before=h.foodRules.length,res=C.removeConditionDeep(h,'reflux');
 ok(res.dropped>0&&!!C.ruleOf(h,'tomates')&&!!C.ruleOf(h,'vin rouge')&&!C.ruleOf(h,'ketchup'),'retirer reflux : enlève '+res.dropped+' aliments jamais triés, garde les choix de l’utilisateur');
 ok(C.ruleOf(h,'vin rouge').refs.every(x=>x.templateId!=='reflux'),'la recommandation reflux est retirée des aliments gardés');
 let h2=C.emptyHealth();C.addCondition(h2,C.CONDITIONS.find(c=>c.id==='coeliaque'));C.loadTemplate(h2,'coeliaque',ING);
 ok(C.ruleOf(h2,'pâtes').status==='UNKNOWN'&&C.suggestionOf(C.ruleOf(h2,'pâtes')).suggested==='STRICT_EXCLUSION'&&!C.suggestionOf(C.ruleOf(h2,'avoine')),'cœliaque : pâtes conseillées « à exclure » (non appliqué), avoine laissée à décider');
 console.log(`\n${n-f}/${n} vérifications réussies`);process.exitCode=f?1:0})();
