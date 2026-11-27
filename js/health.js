/* SwipeRepas 6.3.0 — Fiche « Santé & tolérances ».
   Couche posée PAR-DESSUS app.js + ui6.js, comme ui6 : aucune fonction existante n'est supprimée.

   Principes (cahier des charges du 26/11/2026) :
   - TOUT est modifiable par l'utilisateur, à tout moment (Profil → Santé & tolérances).
   - Aucune recommandation médicale n'est écrite dans ce fichier : les profils de départ viennent de
     js/health-templates.js (sources officielles citées pour chaque aliment). Sans profil sourcé : MANUAL_ONLY.
   - Un aliment proposé par un profil arrive TOUJOURS en « À vérifier pour moi » ; la recommandation générale
     (« suggested ») est affichée, jamais appliquée sans geste de l'utilisateur.
   - La fiche ne modifie jamais les aliments ni les recettes (data/*.json) : c'est une couche de règles
     personnelles lue par le moteur de recommandation.
   - Les identifiants d'aliments sont les clés existantes de data/ingredients.json (aucun identifiant inventé).
     Il n'existe pas encore de familles ni de liens « formes dérivées / plats composés » dans les données :
     ces options sont enregistrées mais affichées « non reliées pour l'instant » (REVIEW).
   - Les données restent sur l'appareil (localStorage, dans le profil). Rien n'est envoyé à un serveur.
*/
(function(root){
'use strict';

/* ======================= 1. NOYAU (sans interface, testable dans Node) ======================= */
const STATUSES=['UNKNOWN','TOLERATED','FAVOR','LIMIT','AVOID','STRICT_EXCLUSION'];
const ORIGINS=['GENERAL_TEMPLATE','PERSONAL_TOLERANCE','MEDICAL_INSTRUCTION','ALLERGY','PERSONAL_PREFERENCE','OTHER'];
const TEMPLATE_STATES=['VERIFIED_TEMPLATE','REVIEW_TEMPLATE','MANUAL_ONLY'];
const STATUS_LABEL={UNKNOWN:'À vérifier pour moi',TOLERATED:'Je tolère',FAVOR:'J’en veux plus souvent',LIMIT:'À limiter',AVOID:'Je préfère éviter',STRICT_EXCLUSION:'Exclusion stricte'};
const ORIGIN_LABEL={GENERAL_TEMPLATE:'Profil général (à adapter)',PERSONAL_TOLERANCE:'Ma tolérance',MEDICAL_INSTRUCTION:'Consigne de mon médecin / diététicien',ALLERGY:'Allergie',PERSONAL_PREFERENCE:'Préférence personnelle',OTHER:'Autre'};
/* Fréquences proposées. Structure prévue pour d'autres périodes que la semaine (period). */
const FREQS=[
 ['never','Jamais',{period:'week',maxOccurrences:0,mode:'max'}],
 ['max1','Maximum 1 fois par semaine',{period:'week',maxOccurrences:1,mode:'max'}],
 ['max2','Maximum 2 fois par semaine',{period:'week',maxOccurrences:2,mode:'max'}],
 ['max3','Maximum 3 fois par semaine',{period:'week',maxOccurrences:3,mode:'max'}],
 ['occasional','Occasionnellement',{period:'week',maxOccurrences:null,mode:'occasional'}],
 ['spread','Pas de limite précise, mais espacer les propositions',{period:'week',maxOccurrences:null,mode:'spread'}]
];
/* Situations proposées dans la recherche : des NOMS seulement.
   Aucune n'a de profil préétabli vérifié → MANUAL_ONLY. Ne pas ajouter de liste d'aliments ici sans vérification séparée. */
const DATA=root.SRHealthData||(typeof require==='function'?(()=>{try{return require('./health-templates.js')}catch(e){return null}})():null)||{templates:{},info:{},sources:{}};
const CONDITIONS=[
 ['reflux','Reflux gastro-œsophagien',['rgo','reflux','brulures d estomac','gerd']],
 ['diabete_1','Diabète de type 1',['diabete','dt1']],
 ['diabete_2','Diabète de type 2',['diabete','dt2']],
 ['prediabete','Prédiabète',['pre diabete','prediabete']],
 ['crohn','Maladie de Crohn',['crohn','mici']],
 ['rch','Rectocolite hémorragique',['rch','rectocolite','mici']],
 ['mici_autre','Autre MICI',['mici','maladie inflammatoire chronique de l intestin']],
 ['endometriose','Endométriose',['endometriose']],
 ['sii','Syndrome de l’intestin irritable',['sii','colon irritable','intestin irritable']],
 ['coeliaque','Maladie cœliaque',['coeliaque','celiaque','gluten']],
 ['allergie_alim','Allergie alimentaire',['allergie']],
 ['intol_lactose','Intolérance au lactose',['lactose','intolerance']],
 ['intol_fructose','Intolérance au fructose',['fructose','intolerance']],
 ['intol_autre','Autre intolérance alimentaire',['intolerance']],
 ['hypertension','Hypertension artérielle',['tension','hypertension','hta']],
 ['cholesterol','Cholestérol élevé',['cholesterol','hypercholesterolemie']],
 ['goutte','Goutte',['goutte','acide urique']],
 ['ulcere','Ulcère de l’estomac ou du duodénum',['ulcere','estomac','duodenum']],
 ['dyspepsie','Dyspepsie (mauvaise digestion)',['dyspepsie','digestion','mauvaise digestion']],
 ['irc','Maladie rénale chronique',['rein','renale','insuffisance renale','irc']]
].map(([id,name,syn])=>{const t=DATA.templates[id];return{id,name,syn,templateStatus:t?'VERIFIED_TEMPLATE':'MANUAL_ONLY',templateId:t?id:null,info:(DATA.info||{})[id]||null}});
/* Profils de départ : seulement ceux de health-templates.js (chaque aliment relié à sa source). */
const TEMPLATES={};for(const[k,t]of Object.entries(DATA.templates||{}))TEMPLATES[k]={status:'VERIFIED_TEMPLATE',checked:DATA.checked,label:t.label,note:t.note,evidence:t.evidence||null,sources:t.sources,foods:t.foods.map(f=>f[0]),items:t.foods.map(([id,suggested,why,freq])=>({id,suggested,why,freq:freq??null})),cook:!!t.cook};
/* Démonstration du swipe : aliments courants SANS lien avec une maladie, clairement marqués « Démo ». */
const DEMO_FOODS=['tomates','oignon','ail','poivrons','lait','pois chiches'];
const GENERIC_ITEMS=['légumes','protéine principale','féculent','fruits'];

const nrm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,' ').replace(/\s+/g,' ').trim();
const now=()=>Date.now();

function emptyHealth(){return{version:1,enabled:true,conditions:[],foodRules:[]}}
function ensure(profile){if(!profile.health||typeof profile.health!=='object')profile.health=emptyHealth();const h=profile.health;h.conditions=Array.isArray(h.conditions)?h.conditions:[];h.foodRules=Array.isArray(h.foodRules)?h.foodRules:[];if(h.enabled===undefined)h.enabled=true;return h}
const active=h=>!!(h&&h.enabled&&Array.isArray(h.foodRules)&&h.foodRules.length);
const ruleOf=(h,id)=>h&&h.foodRules.find(r=>r.foodOrFamilyId===id);

function searchConditions(q,list=CONDITIONS){const n=nrm(q);if(n.length<2)return[];return list.filter(c=>nrm(c.name).includes(n)||c.syn.some(s=>nrm(s).includes(n)||n.includes(nrm(s))&&nrm(s).length>=3))}
function searchFoods(q,ing){const n=nrm(q);if(n.length<2)return[];return Object.keys(ing||{}).filter(k=>nrm(k).includes(n)).sort((a,b)=>nrm(a).indexOf(n)-nrm(b).indexOf(n)||a.length-b.length).slice(0,12)}

function addCondition(h,cond){if(h.conditions.some(c=>c.conditionId===cond.id))return false;
 h.conditions.push({conditionId:cond.id,displayName:cond.name,templateId:cond.templateId||null,templateStatus:TEMPLATE_STATES.includes(cond.templateStatus)?cond.templateStatus:'MANUAL_ONLY',enabled:true,customizedByUser:false,addedAt:now()});return true}
function customCondition(name){const t=String(name||'').trim().slice(0,60);if(!t)return null;return{id:'perso:'+nrm(t).replace(/[^a-z0-9]+/g,'_'),name:t,syn:[],templateStatus:'MANUAL_ONLY',templateId:null}}
function removeCondition(h,id){const i=h.conditions.findIndex(c=>c.conditionId===id);if(i<0)return false;h.conditions.splice(i,1);return true}

function newRule(id,opt={}){const refs=opt.ref?[opt.ref]:[];return{foodOrFamilyId:id,displayName:opt.displayName||id,status:STATUSES.includes(opt.status)?opt.status:'UNKNOWN',origin:ORIGINS.includes(opt.origin)?opt.origin:'PERSONAL_TOLERANCE',
 frequency:null,includeDerivedForms:false,includeCompositeFoods:false,warningBeforeSelection:true,
 templateId:opt.templateId||null,originalTemplateStatus:opt.templateId?'UNKNOWN':null,originalOrigin:opt.templateId?'GENERAL_TEMPLATE':null,
 refs,demo:!!opt.demo,modifiedByUser:false,confirmedByUser:false,acceptCount:0,askLaterUntil:0,keptCount:0,createdAt:now(),updatedAt:now()}}
/* Ajout manuel (par l'utilisateur) : l'aliment doit exister dans la table des ingrédients. */
function addFood(h,id,ing,opt={}){if(ing&&!Object.prototype.hasOwnProperty.call(ing,id))return{ok:false,reason:'REVIEW:aliment_inconnu'};const r=ruleOf(h,id);if(r)return{ok:false,reason:'deja_present',rule:r};const n=newRule(id,opt);h.foodRules.push(n);return{ok:true,rule:n}}
function removeFood(h,id){const i=h.foodRules.findIndex(r=>r.foodOrFamilyId===id);if(i<0)return false;h.foodRules.splice(i,1);return true}
/* Une recommandation automatique n'écrase JAMAIS une règle existante (modifiée ou non par l'utilisateur). */
function loadTemplate(h,templateId,ing,templates=TEMPLATES){const t=templates[templateId];if(!t)return{ok:false,reason:'REVIEW:profil_absent',added:[]};if(t.status!=='VERIFIED_TEMPLATE')return{ok:false,reason:'REVIEW:profil_non_verifie',added:[]};
 const added=[],skipped=[];const items=t.items||(t.foods||[]).map(id=>({id,suggested:'UNKNOWN',why:''}));
 for(const it of items){const id=it.id,ref={templateId,suggested:STATUSES.includes(it.suggested)?it.suggested:'UNKNOWN',why:it.why||'',freq:Number.isInteger(it.freq)?it.freq:null};if(ing&&!Object.prototype.hasOwnProperty.call(ing,id)){skipped.push(id);continue}
  const ex=ruleOf(h,id);if(ex){ex.refs=Array.isArray(ex.refs)?ex.refs:[];if(!ex.refs.some(r=>r.templateId===templateId))ex.refs.push(ref);skipped.push(id);continue}   /* jamais d'écrasement */
  h.foodRules.push(newRule(id,{templateId,origin:'GENERAL_TEMPLATE',status:'UNKNOWN',ref}));added.push(id)}return{ok:true,added,skipped}}
/* Suggestion générale d'un aliment (la plus prudente si plusieurs profils) — affichée, appliquée seulement par l'utilisateur. */
const SUGG_ORDER=['STRICT_EXCLUSION','AVOID','LIMIT','FAVOR','UNKNOWN','TOLERATED'];
function suggestionOf(r){const l=(r.refs||[]).filter(x=>x.suggested&&x.suggested!=='UNKNOWN');if(!l.length)return null;return l.slice().sort((a,b)=>SUGG_ORDER.indexOf(a.suggested)-SUGG_ORDER.indexOf(b.suggested))[0]}
function applySuggestion(r){const s=suggestionOf(r);if(!s)return false;const ok=setStatus(r,s.suggested);if(ok&&(s.suggested==='LIMIT'||s.suggested==='AVOID')&&Number.isInteger(s.freq))setFrequency(r,{period:'week',maxOccurrences:s.freq,mode:'max'});return ok}
/* « Appliquer d'un coup » : seulement les recommandations qui ne suppriment rien (à favoriser ; à limiter ou à éviter AVEC une fréquence),
   jamais les exclusions strictes. */
const gentleKind=s=>s.suggested==='FAVOR'?'fav':(s.suggested==='LIMIT'||(s.suggested==='AVOID'&&Number.isInteger(s.freq)))?'less':null;
function gentleCount(h,templateId){let fav=0,less=0;for(const r of h.foodRules){if(r.status!=='UNKNOWN'||!(r.refs||[]).some(x=>x.templateId===templateId))continue;const s=suggestionOf(r);const k=s&&gentleKind(s);if(k==='fav')fav++;else if(k==='less')less++}return{fav,less}}
function applyGentle(h,templateId){let fav=0,less=0;for(const r of h.foodRules){if(r.status!=='UNKNOWN'||!(r.refs||[]).some(x=>x.templateId===templateId))continue;const s=suggestionOf(r);const k=s&&gentleKind(s);if(!k)continue;applySuggestion(r);if(k==='fav')fav++;else less++}return{fav,less}}
/* ---- Cuisine anti-inflammatoire : adaptation des recettes (astuce culinaire, pas un traitement) ----
   Remplacements 1 pour 1, seulement pour les plats salés (pas les desserts, sauces ni boissons). */
const COOK_SWAPS=[['beurre','huile d’olive'],['huile de tournesol','huile d’olive'],['crème fraîche','crème légère'],['crème liquide','crème légère']];
function cookActive(h){return !!(h&&h.enabled&&h.cookAdapt&&h.conditions.some(c=>c.enabled&&TEMPLATES[c.templateId]&&TEMPLATES[c.templateId].cook))}
const RX=(pre,w)=>new RegExp('(^|[^\\p{L}])'+pre+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?![\\p{L}])','giu');
function cookAdapt(r,h,ing){if(!r||!cookActive(h))return r;const type=String(r[3]||'');if(/^(dessert|sauce|boisson|base)/.test(type))return r;
 /* le beurre n'est pas remplacé quand il donne la texture (pâte, beurre froid en dés, beurre mou…) */
 const stepsTxt=[...(((r[11]||{}).steps)||[]).map(x=>x.text),String(r[5]||'')];const butterStruct=stepsTxt.some(t=>/beurre/i.test(t)&&/(froid|mou|pommade|en d[ée]s|sabl|p[âa]te|feuillet|bris[ée])/i.test(t))||/quiche|tarte|feuillet|crumble/i.test(String(r[1]||''));
 const blocked=to=>{const x=ruleOf(h,to);return x&&(x.status==='STRICT_EXCLUSION'||x.status==='AVOID')};
 const names=String(r[4]||'').split('|').map(x=>x.split(';')[0]);const ch=COOK_SWAPS.filter(([a,b])=>names.includes(a)&&!blocked(b)&&!(a==='beurre'&&butterStruct)&&(!ing||(a in ing&&b in ing)));if(!ch.length)return r;
 const swapList=str=>String(str||'').split('|').map(x=>{const p=x.split(';');const c=ch.find(([a])=>a===p[0]);return c?[c[1],...p.slice(1)].join(';'):x}).join('|');
 const txt=t=>{t=String(t||'');for(const[a,b]of ch){if(a==='beurre'){t=t.replace(RX('du ','beurre'),(m,p)=>p+'de l’huile d’olive').replace(RX('au ','beurre'),(m,p)=>p+'à l’huile d’olive').replace(RX('le ','beurre'),(m,p)=>p+'l’huile d’olive').replace(RX('de ','beurre'),(m,p)=>p+'d’huile d’olive')}
   t=t.replace(RX('',a),(m,p)=>p+b)}return t};
 const m={...(r[11]||{})};if(m.steps)m.steps=m.steps.map(x=>({...x,text:txt(x.text)}));if(m.allege&&m.allege.ings)m.allege={...m.allege,ings:swapList(m.allege.ings)};m.inflam={changes:ch.map(([a,b])=>[a,b])};
 const out=r.slice();out[4]=swapList(r[4]);out[5]=txt(r[5]);out[11]=m;return out}
function templateMissing(h,templateId,ing){const t=TEMPLATES[templateId];if(!t)return[];return t.foods.filter(id=>(!ing||Object.prototype.hasOwnProperty.call(ing,id))&&!ruleOf(h,id))}
/* Retirer une situation : on retire seulement les aliments venus de ce profil que l'utilisateur n'a jamais touchés. */
function removeConditionDeep(h,id){const c=h.conditions.find(x=>x.conditionId===id);if(!c)return{removed:false,dropped:0};const tid=c.templateId;removeCondition(h,id);let dropped=0;
 if(tid)h.foodRules=h.foodRules.filter(r=>{r.refs=(r.refs||[]).filter(x=>x.templateId!==tid);const fromThis=r.templateId===tid;if(fromThis&&!r.confirmedByUser&&!r.modifiedByUser&&!r.refs.length){dropped++;return false}if(fromThis&&r.refs.length){r.templateId=r.refs[0].templateId}return true});
 return{removed:true,dropped}}
function loadDemo(h,ing){const added=[];for(const id of DEMO_FOODS){if(ing&&!Object.prototype.hasOwnProperty.call(ing,id))continue;if(ruleOf(h,id))continue;h.foodRules.push(newRule(id,{demo:true,origin:'OTHER'}));added.push(id)}return added}

/* Modifications : toujours explicites. Assouplir une exclusion stricte enregistrée comme allergie ou consigne médicale demande confirmation. */
const isProtected=r=>r.status==='STRICT_EXCLUSION'&&(r.origin==='ALLERGY'||r.origin==='MEDICAL_INSTRUCTION');
const needsConfirm=(r,change)=>isProtected(r)&&(change==='delete'||(change.status&&change.status!=='STRICT_EXCLUSION')||(change.origin&&change.origin!=='ALLERGY'&&change.origin!=='MEDICAL_INSTRUCTION'));
function touch(r){r.modifiedByUser=r.templateId?(r.status!==r.originalTemplateStatus||r.origin!==r.originalOrigin||!!r.frequency):true;r.confirmedByUser=true;r.updatedAt=now()}
function setStatus(r,s){if(!STATUSES.includes(s))return false;r.status=s;if(s!=='LIMIT'&&s!=='AVOID')r.frequency=null;r.acceptCount=0;touch(r);return true}
function setOrigin(r,o){if(!ORIGINS.includes(o))return false;r.origin=o;touch(r);return true}
function setFrequency(r,f){if(f===null){r.frequency=null;touch(r);return true}if(!f||typeof f!=='object')return false;const p=f.period||'week';const m=f.maxOccurrences;if(m!==null&&m!==undefined&&!(Number.isInteger(m)&&m>=0&&m<=21))return false;r.frequency={period:p,maxOccurrences:m??null,mode:f.mode||(m==null?'spread':'max'),...(f.custom?{custom:true}:{})};touch(r);return true}
function resetToTemplate(r){if(!r.templateId)return false;r.status=r.originalTemplateStatus||'UNKNOWN';r.origin=r.originalOrigin||'GENERAL_TEMPLATE';r.frequency=null;r.modifiedByUser=false;r.confirmedByUser=false;r.updatedAt=now();return true}

/* ---------- Lien recette → aliments (lecture seule des données canoniques) ---------- */
function recipeFoods(r){const out=new Set();let generic=false;const add=s=>String(s||'').split('|').forEach(x=>{const n=x.split(';')[0].trim();if(!n)return;if(GENERIC_ITEMS.includes(n))generic=true;else out.add(n)});
 if(!r)return{foods:[],unresolved:false};add(r[4]);const m=r[11]||{};if(m.allege&&m.allege.ings)add(m.allege.ings);return{foods:[...out],unresolved:generic}}
/* Produits composés : les relations plat → sauce → ingrédient n'existent pas encore dans les données.
   On ne les invente pas : seuls les ingrédients listés dans la recette sont lus. */
/* Désactiver une situation met en pause les aliments qui viennent UNIQUEMENT de son profil et dont l'origine est restée « profil général ». */
function ruleActive(x,h){if(x.origin!=='GENERAL_TEMPLATE'||!(x.refs||[]).length)return true;return x.refs.some(ref=>{const c=h.conditions.find(c=>c.templateId===ref.templateId);return !c||c.enabled})}
function matches(r,h){if(!active(h))return[];const f=recipeFoods(r).foods;return h.foodRules.filter(x=>f.includes(x.foodOrFamilyId)&&ruleActive(x,h))}
function countSelected(id,selected,recipes){let n=0;for(const s of selected||[]){const r=recipes[s.id];if(r&&recipeFoods(r).foods.includes(id))n+=Number(s.rep)||1}return n}
const PRIO=r=>r.status==='STRICT_EXCLUSION'?(r.origin==='ALLERGY'?0:r.origin==='MEDICAL_INSTRUCTION'?1:2):r.status==='AVOID'?3:r.status==='LIMIT'?4:r.status==='UNKNOWN'?5:r.status==='FAVOR'?6:7;
/* Décision pour une recette :
   exclude  : STRICT_EXCLUSION, ou limite de fréquence atteinte, ou fréquence « Jamais »
   downrank : AVOID (très forte baisse), Occasionnellement, « espacer » déjà servi cette semaine
   ok       : TOLERATED, UNKNOWN, LIMIT sous la limite */
function decide(r,h,ctx={}){const ms=matches(r,h).sort((a,b)=>PRIO(a)-PRIO(b));let action='ok',weight=1;const reasons=[];
 for(const x of ms){const f=x.frequency;const used=(f||x.status==='LIMIT')?countSelected(x.foodOrFamilyId,ctx.selected,ctx.recipes||[]):0;let a='ok',w=1;
  if(x.status==='STRICT_EXCLUSION'){a='exclude'}
  else if(x.status==='AVOID'||x.status==='LIMIT'){
   if(f&&f.mode==='max'&&f.maxOccurrences!=null&&used>=f.maxOccurrences)a='exclude';
   else if(x.status==='AVOID'){a='downrank';w=.15}
   else if(f&&f.mode==='occasional'){a='downrank';w=.25}
   else if((!f||f.mode==='spread')&&used>=1){a='downrank';w=.3}
   if(x.status==='AVOID'&&f&&f.mode==='occasional')w=Math.min(w,.15)}
  if(a!=='ok')reasons.push({id:x.foodOrFamilyId,status:x.status,origin:x.origin,action:a,used});
  if(a==='exclude')action='exclude';else if(a==='downrank'&&action!=='exclude'){action='downrank';weight=Math.min(weight,w)}}
 const favor=ms.filter(x=>x.status==='FAVOR').length,nf=recipeFoods(r).foods.length;
 return{action,weight:action==='exclude'?0:weight,reasons,matched:ms,favor,favorShare:nf?favor/nf:0}}
/* Diversification : on ne supprime que ce qui doit l'être ; le reste est gardé, les plats « à éviter » passent en fin de pile
   et seule une petite part est conservée, pour laisser la place à d'autres plats cohérents. */
/* Aliments « à favoriser » : rien n'est retiré, les plats qui en contiennent remontent dans la pile.
   Tirage pondéré selon la PART d'aliments favorisés dans la recette (poids de 1 à 9) : un plat saumon-légumes passe
   plus souvent devant qu'un plat steak-frites, sans que la pile devienne toujours la même. */
function applyPool(list,h,ctx={},rand=Math.random){if(!active(h)||!Array.isArray(list))return list;const keep=[],later=[];let anyFav=false;
 for(const r of list){const d=decide(r,h,ctx);if(d.action==='exclude')continue;if(d.action==='downrank'){if(rand()<d.weight)later.push(r)}else{keep.push([r,d.favorShare]);if(d.favor)anyFav=true}}
 const k=anyFav?keep.map(([r,sh])=>[r,Math.pow(Math.max(rand(),1e-9),1/Math.pow(1+2*sh,2))]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]):keep.map(x=>x[0]);
 return k.concat(later)}
const strictHit=(r,h)=>matches(r,h).some(x=>x.status==='STRICT_EXCLUSION');

/* ---------- Apprentissage : jamais de modification silencieuse ---------- */
function onAccept(r,h){if(!active(h))return[];const out=[];for(const x of matches(r,h))if(x.status==='AVOID'||x.status==='LIMIT'){x.acceptCount=(x.acceptCount||0)+1;out.push(x.foodOrFamilyId)}return out}
function pending(h,t=now()){if(!active(h))return[];return h.foodRules.filter(x=>(x.status==='AVOID'||x.status==='LIMIT')&&(x.acceptCount||0)>=3+3*(x.keptCount||0)&&!((x.askLaterUntil||0)>t))}
function answerKeep(r){r.keptCount=(r.keptCount||0)+1;r.acceptCount=0;r.updatedAt=now()}
function answerLater(r,t=now()){r.askLaterUntil=t+7*864e5}

const Core={COOK_SWAPS,cookActive,cookAdapt,applyGentle,gentleCount,DATA,STATUSES,ORIGINS,TEMPLATE_STATES,STATUS_LABEL,ORIGIN_LABEL,FREQS,CONDITIONS,TEMPLATES,DEMO_FOODS,suggestionOf,applySuggestion,templateMissing,removeConditionDeep,ruleActive,
 emptyHealth,ensure,active,ruleOf,searchConditions,searchFoods,addCondition,customCondition,removeCondition,addFood,removeFood,loadTemplate,loadDemo,
 isProtected,needsConfirm,setStatus,setOrigin,setFrequency,resetToTemplate,recipeFoods,matches,countSelected,decide,applyPool,strictHit,onAccept,pending,answerKeep,answerLater,nrm};
if(typeof module!=='undefined'&&module.exports){module.exports=Core}
root.SRHealth=Core;

/* ======================= 2. BRANCHEMENT DANS L'APPLICATION ======================= */
/* state, save, ING sont des variables d'app.js (portée globale du script, pas des propriétés de window) */
if(typeof state==='undefined'||typeof root.render!=='function')return;   /* chargé seul (tests du noyau) */
const S=state,app=root.document.getElementById('app');
const H=()=>S.profile.health;                         /* peut être absent : la fiche n'est créée que si l'utilisateur l'ouvre */
const HE=()=>Core.ensure(S.profile);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ING_=()=>(typeof ING!=='undefined'&&ING)||{};
const selCtx=()=>({selected:(S.saved&&S.saved.length)?S.saved:Object.values(S.planner||{}).map(id=>({id,rep:1})),recipes:S.recipes||[]});
const persist=()=>{try{save()}catch(e){}};

/* --- Moteur : exclusions strictes partout où l'app vérifie déjà allergies/interdictions --- */
const allergyHit0=root.allergyHit;root.allergyHit0h=allergyHit0;
root.allergyHit=function(r){return allergyHit0.apply(this,arguments)||Core.strictHit(r,H())};
/* --- Moteur : pile des swipes (fréquences, « à éviter », diversification) --- */
const phasePool0=root.phasePool;root.phasePool0h=phasePool0;
root.phasePool=function(p){const a=phasePool0.apply(this,arguments);return Core.applyPool(a,H(),selCtx())};
/* --- Swipe des repas : retirer ce qui vient de dépasser une limite + avertissement sur la carte --- */
const swipe0=root.swipe;root.swipe0h=swipe0;
root.swipe=function(){const h=H();let warn='';if(Core.active(h)&&Array.isArray(S.deck)){let guard=0;while(S.deck[S.deckIndex]&&guard++<500&&Core.decide(S.deck[S.deckIndex],h,selCtx()).action==='exclude')S.deck.splice(S.deckIndex,1);
  const r=S.deck[S.deckIndex];if(r){const ms=Core.matches(r,h).filter(x=>x.warningBeforeSelection&&x.status!=='TOLERATED'&&x.status!=='UNKNOWN');if(ms.length)warn=`<p class="hwarn">⚠️ Contient : ${ms.map(x=>esc(x.displayName)+' <small>('+Core.STATUS_LABEL[x.status].toLowerCase()+freqTxt(x)+')</small>').join(', ')}</p>`;
   const fv=Core.matches(r,h).filter(x=>x.status==='FAVOR');if(fv.length)warn+=`<p class="hfav">🌿 Avec ${fv.slice(0,3).map(x=>esc(x.displayName)).join(', ')} : des aliments que vous voulez favoriser</p>`}}
 const out=swipe0.apply(this,arguments);return warn?out.replace('<div class="swipe-body">','<div class="swipe-body">'+warn):out};
function freqTxt(x){const f=x.frequency;if(!f)return'';if(f.mode==='max')return f.maxOccurrences===0?' · jamais':' · max '+f.maxOccurrences+'×/sem.';return f.mode==='occasional'?' · occasionnellement':' · espacer'}

/* ---------- Écrans ---------- */
const chip=(on,attr,label)=>`<button class="chip ${on?'on':''}" ${attr}>${label}</button>`;
const DISCLAIMER=`<p class="hnote"><b>Ces réglages sont une aide à la personnalisation alimentaire et ne remplacent pas un avis médical.</b> Les profils proposés reposent sur des recommandations générales et doivent être adaptés à votre situation et aux recommandations de votre médecin ou diététicien.</p>`;
function condInfo(c){const t=c.templateId&&Core.TEMPLATES[c.templateId];return t&&t.evidence?'Recommandations générales disponibles (niveau de preuve '+t.evidence+')':c.templateStatus==='VERIFIED_TEMPLATE'?'Recommandations générales disponibles (sources officielles)':c.templateStatus==='REVIEW_TEMPLATE'?'Profil en cours de vérification : pas encore proposé':'Pas de liste d’aliments préétablie : vous choisissez vous-même'}
const srcLinks=ids=>(ids||[]).map(k=>Core.DATA.sources[k]).filter(Boolean).map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.title)}</a>`).join('');
const SUG_TXT={FAVOR:'à favoriser',LIMIT:'à limiter',AVOID:'à éviter',STRICT_EXCLUSION:'à exclure',UNKNOWN:'à vérifier',TOLERATED:'toléré'};
const groupItems=items=>{const m=new Map();for(const it of items){const k=it.suggested+'|'+it.why;if(!m.has(k))m.set(k,{suggested:it.suggested,why:it.why,freq:it.freq,ids:[]});m.get(k).ids.push(it.id)}return[...m.values()]};
function cookRow(){const h=H(),on=!!(h&&h.cookAdapt);return `<div class="hcook"><div class="row6"><span>🍳 <b>Adapter mes recettes</b> (cuisine anti-inflammatoire)</span><div class="seg6"><button class="${on?'on':''}" data-hcook="1">Oui</button><button class="${on?'':'on'}" data-hcook="0">Non</button></div></div><p class="muted small">Dans les plats salés : ${Core.COOK_SWAPS.map(([a,b])=>`${esc(a)} → <b>${esc(b)}</b>`).join(', ')}. Même quantité, même cuisson. Les desserts et les sauces ne changent pas. C’est une astuce de cuisine, pas un traitement.</p></div>`}
const condMeta=id=>Core.CONDITIONS.find(x=>x.id===id)||null;
function condPanel(c){const m=condMeta(c.conditionId),t=c.templateId&&Core.TEMPLATES[c.templateId];
 if(t){const miss=Core.templateMissing(H(),c.templateId,ING_());
  return `<div class="hpanel">${t.evidence?`<p class="hev">Niveau de preuve : ${esc(t.evidence)}</p>`:''}<p>${esc(t.note)}</p><p class="small"><b>Recommandations générales — à vérifier pour vous :</b></p><ul class="hlist">${groupItems(t.items).map(g=>`<li><b>${g.ids.map(esc).join(', ')}</b> · ${sugTxt(g)}<br><small>${esc(g.why)}</small></li>`).join('')}</ul>${t.cook?cookRow():''}
  ${(()=>{const g=Core.gentleCount(H(),c.templateId);const parts=[g.fav?g.fav+' à favoriser':'',g.less?g.less+' à éviter ou limiter (sans suppression)':''].filter(Boolean);return parts.length?`<button class="btn secondary wide" data-hfavall="${esc(c.conditionId)}">🌿 Appliquer d’un coup : ${parts.join(', ')}</button><p class="muted small">Rien n’est supprimé. Chaque aliment reste modifiable.</p>`:''})()}
  ${miss.length?`<button class="btn wide" data-htpl="${esc(c.conditionId)}">Ajouter ces ${miss.length} aliment${miss.length>1?'s':''} à vérifier</button><p class="muted small">Ils arriveront en « À vérifier pour moi » : c’est vous qui décidez, aliment par aliment.</p>`:`<p class="muted small">✓ Tous ces aliments sont dans votre liste.</p>`}
  <div class="hsrc"><b>Sources</b> (vérifiées le ${esc(t.checked||'')}) :${srcLinks(t.sources)}</div><p class="muted small">${esc(Core.DATA.verification||'')}</p></div>`}
 const inf=m&&m.info;return inf?`<div class="hpanel"><p>${esc(inf.text)}</p>${inf.sources&&inf.sources.length?`<div class="hsrc"><b>Source</b> :${srcLinks(inf.sources)}</div>`:''}</div>`:''}
const sugTxt=sg=>(sg.suggested==='LIMIT'||sg.suggested==='AVOID')&&Number.isInteger(sg.freq)?`${SUG_TXT[sg.suggested]} (${sg.freq===1?'1 fois':sg.freq+' fois'} par semaine maximum)`:SUG_TXT[sg.suggested]||'à vérifier';
function sugLine(x){const sg=Core.suggestionOf(x);return sg?`<small class="hsug">Recommandation générale (${esc((Core.TEMPLATES[sg.templateId]||{}).label||'')}) : ${sugTxt(sg)}</small>`:''}
function questions(h){return Core.pending(h).map(x=>`<div class="hask"><p>Vous acceptez régulièrement les plats contenant <b>${esc(x.displayName)}</b>. Souhaitez-vous modifier votre préférence ?</p><div class="actions"><button class="btn" data-hask="${esc(x.foodOrFamilyId)}|edit">Oui, modifier</button><button class="btn secondary" data-hask="${esc(x.foodOrFamilyId)}|keep">Non, conserver mon réglage</button><button class="btn secondary" data-hask="${esc(x.foodOrFamilyId)}|later">Me redemander plus tard</button></div></div>`).join('')}
function ruleRow(x){return `<button class="hrow" data-hedit="${esc(x.foodOrFamilyId)}"><span class="hname">${esc(x.displayName)}${x.demo?' <i class="hdemo">Démo</i>':''}</span><span class="hpill s-${x.status}">${Core.STATUS_LABEL[x.status]}</span><small>${Core.ORIGIN_LABEL[x.origin]}${freqTxt(x)}${Core.ruleActive(x,H())?'':' · en pause'}</small>${x.status==='UNKNOWN'?sugLine(x):''}</button>`}
function condRes(q){const l=Core.searchConditions(q);const t=String(q||'').trim();if(t.length<2)return'';return l.map(c=>`<button class="chip" data-hcond="${c.id}">${esc(c.name)}</button>`).join('')+`<button class="chip" data-hcondperso="${esc(t)}">+ Ajouter « ${esc(t)} »</button>`}
function foodRes(q){const h=H();const l=Core.searchFoods(q,ING_());if(String(q||'').trim().length<2)return'';if(!l.length)return `<p class="muted small">Aucun aliment de ce nom dans la base de l’app pour l’instant.</p>`;return l.map(k=>{const has=h&&Core.ruleOf(h,k);return `<button class="chip ${has?'on':''}" data-hfood="${esc(k)}">${has?'✓ ':'+ '}${esc(k)}</button>`}).join('')}

function healthScreen(){const h=HE();const rules=h.foodRules,unk=rules.filter(x=>x.status==='UNKNOWN').length;
 const groups=['STRICT_EXCLUSION','AVOID','LIMIT','UNKNOWN','FAVOR','TOLERATED'].map(s=>[s,rules.filter(x=>x.status===s)]).filter(g=>g[1].length);
 return `<div class="health6"><button class="chip" data-go="profile">← Profil</button>
 <h1 class="h6">Santé & tolérances</h1><p class="muted">Daily peut adapter vos propositions de repas à vos besoins et tolérances alimentaires.</p>${DISCLAIMER}
 <div class="row6"><span>Adapter mes repas avec ces réglages</span><div class="seg6"><button class="${h.enabled?'on':''}" data-henable="1">Oui</button><button class="${h.enabled?'':'on'}" data-henable="0">Non</button></div></div>
 ${questions(h)}
 <h2 class="h2h">Ma situation</h2>
 <input class="hsearch" data-hcondq placeholder="Rechercher une situation de santé…" autocomplete="off" aria-label="Rechercher une situation de santé"><div class="chips" data-hcondres></div>
 ${h.conditions.map(c=>{const open=S.hCondOpen===c.conditionId,hasP=!!(c.templateId&&Core.TEMPLATES[c.templateId])||!!(condMeta(c.conditionId)||{}).info;return `<div class="hcond ${c.enabled?'':'off'}"><div class="hcondtop"><div><b>${esc(c.displayName)}</b><small>${c.enabled?condInfo(c):'En pause : ses aliments « profil général » ne sont plus pris en compte'}</small></div></div>
  <div class="actions">${hasP?`<button class="chip ${open?'on':''}" data-hcondopen="${esc(c.conditionId)}">${open?'Masquer':'Voir les recommandations'}</button>`:''}<button class="chip" data-hcondon="${esc(c.conditionId)}">${c.enabled?'Mettre en pause':'Réactiver'}</button><button class="chip" data-hcondrm="${esc(c.conditionId)}">Retirer</button></div>${open?condPanel(c):''}</div>`}).join('')}
 ${h.conditions.length?`<p class="muted small">Ajoutez aussi les consignes données personnellement par votre médecin ou diététicien : elles passent avant les recommandations générales.</p>`:''}
 <h2 class="h2h">Mes aliments</h2>
 <input class="hsearch" data-hfoodq placeholder="Ajouter un aliment (ex. tomates)…" autocomplete="off" aria-label="Ajouter un aliment"><div class="chips" data-hfoodres></div>
 ${unk?`<button class="btn wide" data-go="healthSwipe">Trier ${unk} aliment${unk>1?'s':''} en quelques swipes</button>`:''}
 ${!rules.length?`<button class="btn secondary wide" data-hdemo>Essayer le tri par swipe (exemples de démonstration)</button><p class="muted small">Les exemples de démonstration ne sont liés à aucune maladie. Vous pouvez les supprimer à tout moment.</p>`:''}
 ${groups.map(([s,l])=>`<h3 class="h3h">${Core.STATUS_LABEL[s]} · ${l.length}</h3>${l.map(ruleRow).join('')}`).join('')}
 ${rules.length||h.conditions.length?`<button class="btn secondary wide hdanger" data-hwipe>Supprimer toutes mes informations santé</button>`:''}
 <p class="muted small">Ces informations restent sur cet appareil et ne sont jamais partagées.</p></div>${S.hEdit?editSheet():''}`}

function editSheet(){const h=H(),x=h&&Core.ruleOf(h,S.hEdit);if(!x){S.hEdit=null;return''}const id=esc(x.foodOrFamilyId);
 const why=x.demo?'Exemple de démonstration, sans lien avec une situation de santé.':x.templateId?'Proposé par une recommandation générale : à vérifier pour vous.':'Ajouté par vous.';
 const refs=(x.refs||[]).map(rf=>{const t=Core.TEMPLATES[rf.templateId]||{};return `<div class="hpanel small"><b>${esc(t.label||rf.templateId)}</b> · recommandation générale : ${sugTxt(rf)}<br>${esc(rf.why)}<div class="hsrc">${srcLinks(t.sources)}</div></div>`}).join('');
 const sg=Core.suggestionOf(x);
 const fq=x.frequency,fk=fq?(fq.custom?'custom':(Core.FREQS.find(f=>f[2].mode===fq.mode&&f[2].maxOccurrences===fq.maxOccurrences)||['custom'])[0]):'';
 return `<div class="modal" data-hsheet><article class="sheet"><button class="chip" data-hclose>✕</button><h2>${esc(x.displayName)}${x.demo?' <i class="hdemo">Démo</i>':''}</h2>
 <p class="muted small"><b>Pourquoi cet aliment est présenté :</b> ${why}</p>${refs}${sg&&x.status!==sg.suggested?`<button class="btn secondary" data-hsugg="${id}">Suivre la recommandation générale : ${sugTxt(sg)}</button>`:''}
 <div class="field"><label>Mon choix</label><div class="chips">${Core.STATUSES.map(s=>chip(x.status===s,`data-hset="${id}|status|${s}"`,Core.STATUS_LABEL[s])).join('')}</div></div>
 ${x.status==='LIMIT'||x.status==='AVOID'?`<div class="field"><label>À quelle fréquence souhaitez-vous encore voir cet aliment dans vos repas ?</label><div class="chips">${Core.FREQS.map(f=>chip(fk===f[0],`data-hset="${id}|freq|${f[0]}"`,f[1])).join('')}${chip(fk==='custom',`data-hset="${id}|freq|custom"`,'Personnaliser')}</div>${fk==='custom'?`<div class="hcustom"><span>Maximum</span><input type="number" min="0" max="21" data-hfreqn="${id}" value="${fq&&fq.maxOccurrences!=null?fq.maxOccurrences:1}"><span>fois par semaine</span></div>`:''}</div>`:''}
 <div class="field"><label>Origine</label><div class="chips">${Core.ORIGINS.map(o=>chip(x.origin===o,`data-hset="${id}|origin|${o}"`,Core.ORIGIN_LABEL[o])).join('')}</div></div>
 <div class="row6"><span>M’avertir avant de choisir un plat qui en contient</span><div class="seg6"><button class="${x.warningBeforeSelection?'on':''}" data-hset="${id}|warn|1">Oui</button><button class="${x.warningBeforeSelection?'':'on'}" data-hset="${id}|warn|0">Non</button></div></div>
 <div class="row6"><span>Inclure les formes dérivées (sauce, concentré…)</span><div class="seg6"><button class="${x.includeDerivedForms?'on':''}" data-hset="${id}|derived|1">Oui</button><button class="${x.includeDerivedForms?'':'on'}" data-hset="${id}|derived|0">Non</button></div></div>
 <div class="row6"><span>Inclure les plats composés qui en contiennent</span><div class="seg6"><button class="${x.includeCompositeFoods?'on':''}" data-hset="${id}|composite|1">Oui</button><button class="${x.includeCompositeFoods?'':'on'}" data-hset="${id}|composite|0">Non</button></div></div>
 <p class="muted small">Pour l’instant, Daily reconnaît seulement « ${esc(x.displayName)} » quand il est écrit tel quel dans la recette. Les formes dérivées et les plats composés ne sont pas encore reliés : ajoutez-les séparément si besoin (ex. « concentré de tomate »).</p>
 <div class="actions">${x.templateId&&x.modifiedByUser?`<button class="btn secondary" data-hreset="${id}">Rétablir la proposition initiale</button>`:''}<button class="btn secondary hdanger" data-hdel="${id}">Retirer cet aliment</button><button class="btn" data-hclose>Terminé</button></div></article></div>`}

function swipeScreen(){const h=HE(),todo=h.foodRules.filter(x=>x.status==='UNKNOWN');const x=todo[0];
 if(!x)return `<div class="health6 center"><div class="daily-tip">${root.dailyFig?root.dailyFig('applaudir'):''}<p>C’est noté ! Vous pouvez tout modifier quand vous voulez.</p></div><button class="btn" data-go="health">Voir mes aliments</button></div>`;
 const done=h.foodRules.length-todo.length;
 return `<div class="health6 hswipe"><button class="chip" data-go="health">← Santé & tolérances</button><p class="center muted">${done+1} / ${h.foodRules.length}</p>
 <article class="hcard" data-hcard="${esc(x.foodOrFamilyId)}" tabindex="0"><span class="hcard-up">↑ Exclure</span><span class="hcard-down">↓ J’en veux plus</span><h2>${esc(x.displayName)}</h2>${x.demo?'<i class="hdemo">Démo</i>':''}${sugLine(x)}<p class="muted small">Touchez la carte pour le détail et la source</p></article>
 <div class="hbtns"><button class="hb nope" data-hswipe="AVOID">← Je préfère éviter</button><button class="hb ok" data-hswipe="TOLERATED">Je tolère →</button><button class="hb excl" data-hswipe="STRICT_EXCLUSION">↑ Exclure</button><button class="hb fav" data-hswipe="FAVOR">↓ J’en veux plus</button></div>
 ${Core.suggestionOf(x)?`<button class="btn secondary wide hsugbtn" data-hswipe="SUGGESTED">Suivre la recommandation : ${sugTxt(Core.suggestionOf(x))}</button>`:''}<button class="chip center-block" data-hswipe="skip">Décider plus tard</button></div>${S.hEdit?editSheet():''}`}

/* --- Recettes : adaptation « cuisine anti-inflammatoire » par-dessus l'adaptation régime d'app.js (adaptAll) --- */
let _cookKey=null;
const cookKey=()=>Core.cookActive(H())?'on':'off';
const adaptAll0=root.adaptAll;
if(typeof adaptAll0==='function'){root.adaptAll0h=adaptAll0;root.adaptAll=function(force){const k=cookKey(),before=state.recipes,chg=k!==_cookKey;adaptAll0.call(this,force||chg);
  if(state.recipes!==before||chg){_cookKey=k;if(k==='on'){const old=new Map(state.recipes.map((r,i)=>[r,i])),h=H(),I=ING_();state.recipes=state.recipes.map(r=>Core.cookAdapt(r,h,I));
   if(Array.isArray(state.deck)&&state.deck.length)state.deck=state.deck.map(r=>{const i=old.get(r);return i!=null?state.recipes[i]:r})}}}}
function cookRefresh(){try{root.adaptAll(true)}catch(e){}}
const adapteNote0=root.adapteNote;
if(typeof adapteNote0==='function')root.adapteNote=function(r){const a=adapteNote0.apply(this,arguments),c=(r&&r[11]&&r[11].inflam)||null;if(!c)return a;
 return a+`<p class="adapte hcookn">🌿 <b>Version cuisine anti-inflammatoire</b> : ${c.changes.map(([x,y])=>`${esc(x)} → <b>${esc(y)}</b>`).join(', ')} (même quantité). <small class="muted">Astuce : ajoutez des herbes fraîches, du gingembre ou du curry en fin de cuisson. Réglage : Profil → Santé & tolérances.</small></p>`};
/* --- Rendu --- */
const render1=root.render;root.render1h=render1;
root.render=function(){if((S.view==='health'||S.view==='healthSwipe')&&S.cook==null){const v=S.view;S.view='profile';const nv=root.nav();S.view=v;app.innerHTML=(root.topBar?root.topBar():'')+(v==='health'?healthScreen():swipeScreen())+nv+(S.modal!=null&&typeof root.modal==='function'?root.modal(S.modal):'');try{root.garde6&&root.garde6()}catch(e){}return}return render1.apply(this,arguments)};
/* --- Entrée depuis le Profil --- */
const profile1=root.profile;root.profile1h=profile1;
root.profile=function(){const out=profile1.apply(this,arguments),h=H(),n=h?h.foodRules.length:0;
 const box=`<button class="act6 hentry" data-go="health"><span>🩺</span><b>Santé & tolérances</b><small>${h&&h.enabled&&n?n+' aliment'+(n>1?'s':'')+' pris en compte':'Adapter mes repas à mes besoins (facultatif)'}</small></button>`;
 const k='<div class="actions"><button class="btn secondary" data-dailyagain>';return out.includes(k)?out.replace(k,box+k):box+out};
/* --- Daily pose la question d'apprentissage aussi à l'accueil --- */
const home1=root.home;root.home1h=home1;
root.home=function(){const out=home1.apply(this,arguments),q=questions(H());return q?out+`<div class="home6">${q}</div>`:out};

/* --- Clics (capture, après ceux de ui6) --- */
app.addEventListener('click',e=>{const b=e.target.closest('button,summary');if(!b)return;const D=b.dataset,stop=()=>{e.stopPropagation();e.preventDefault()},rr=()=>{persist();root.render()};
 /* apprentissage : on compte, on ne modifie rien */
 if(D.swipe==='yes'&&S.view==='swipe'){const r=S.deck&&S.deck[S.deckIndex];if(r&&Core.onAccept(r,H()).length)persist();return}
 if(D.go==='health'||D.go==='healthSwipe'){stop();S.modal=null;S.hEdit=null;HE();S.view=D.go;rr();try{root.scrollTo(0,0)}catch(x){}return}
 if(D.henable){stop();HE().enabled=D.henable==='1';cookRefresh();return rr()}
 if(D.hcond){stop();const c=Core.CONDITIONS.find(x=>x.id===D.hcond);if(c&&Core.addCondition(HE(),c)){S.hCondOpen=(c.templateId||c.info)?c.id:null;root.toast(c.name+' ajouté')}return rr()}
 if(D.hfavall){stop();const c=HE().conditions.find(x=>x.conditionId===D.hfavall);const res=c?Core.applyGentle(HE(),c.templateId):{fav:0,less:0};root.toast(res.fav+' à favoriser, '+res.less+' à éviter ou limiter. Tout reste modifiable.');return rr()}
 if(D.hcook){stop();const h=HE();h.cookAdapt=D.hcook==='1';h.cookAdaptByUser=true;cookRefresh();root.toast(h.cookAdapt?'Recettes adaptées (cuisine anti-inflammatoire)':'Recettes d’origine');return rr()}
 if(D.hcondopen){stop();S.hCondOpen=S.hCondOpen===D.hcondopen?null:D.hcondopen;return rr()}
 if(D.hsugg){stop();const x=Core.ruleOf(HE(),D.hsugg);if(x){if(Core.needsConfirm(x,{status:(Core.suggestionOf(x)||{}).suggested})&&!root.confirm('Cet aliment est enregistré comme exclusion stricte (allergie ou consigne médicale). Changer quand même ?'))return;Core.applySuggestion(x)}return rr()}
 if(D.hcondperso){stop();const c=Core.customCondition(D.hcondperso);if(c&&Core.addCondition(HE(),c))root.toast('Situation ajoutée');return rr()}
 if(D.hcondon){stop();const c=HE().conditions.find(x=>x.conditionId===D.hcondon);if(c){c.enabled=!c.enabled;c.customizedByUser=true}cookRefresh();return rr()}
 if(D.hcondrm){stop();const res=Core.removeConditionDeep(HE(),D.hcondrm);if(S.hCondOpen===D.hcondrm)S.hCondOpen=null;cookRefresh();root.toast(res.dropped?'Situation retirée, avec '+res.dropped+' aliment(s) que vous n’aviez pas encore triés':'Situation retirée (vos choix sont conservés)');return rr()}
 if(D.htpl){stop();const c=HE().conditions.find(x=>x.conditionId===D.htpl);const res=c?Core.loadTemplate(HE(),c.templateId,ING_()):{ok:false};if(res.ok&&Core.TEMPLATES[c.templateId].cook&&!HE().cookAdaptByUser){HE().cookAdapt=true;cookRefresh()}root.toast(res.ok?res.added.length+' aliment(s) à vérifier ajoutés. Vous pourrez tout modifier.':'Profil non disponible (en vérification)');if(res.ok&&res.added.length){S.view='healthSwipe';S.hCondOpen=null}return rr()}
 if(D.hfood){stop();const h=HE(),ex=Core.ruleOf(h,D.hfood);if(ex){S.hEdit=D.hfood;return rr()}const res=Core.addFood(h,D.hfood,ING_());if(res.ok){S.hEdit=D.hfood}else root.toast('Aliment non reconnu');return rr()}
 if(D.hdemo!==undefined){stop();const n=Core.loadDemo(HE(),ING_()).length;root.toast(n+' exemples de démonstration');S.view='healthSwipe';return rr()}
 if(D.hedit){stop();S.hEdit=D.hedit;return rr()}
 if(D.hclose!==undefined){stop();S.hEdit=null;return rr()}
 if(D.hset){stop();const[id,k,v]=D.hset.split('|');const x=Core.ruleOf(HE(),id);if(!x)return;
  if(k==='status'){if(Core.needsConfirm(x,{status:v})&&!root.confirm('Cet aliment est enregistré comme exclusion stricte (allergie ou consigne médicale). Voulez-vous vraiment changer ce réglage ?'))return;Core.setStatus(x,v)}
  else if(k==='origin'){if(Core.needsConfirm(x,{origin:v})&&!root.confirm('Cet aliment est enregistré comme allergie ou consigne médicale. Voulez-vous vraiment changer son origine ?'))return;Core.setOrigin(x,v)}
  else if(k==='freq'){if(v==='custom')Core.setFrequency(x,{period:'week',maxOccurrences:x.frequency&&x.frequency.maxOccurrences!=null?x.frequency.maxOccurrences:1,mode:'max',custom:true});else{const f=Core.FREQS.find(f=>f[0]===v);if(f)Core.setFrequency(x,f[2])}}
  else if(k==='warn'){x.warningBeforeSelection=v==='1';x.updatedAt=Date.now()}
  else if(k==='derived'){x.includeDerivedForms=v==='1';x.updatedAt=Date.now()}
  else if(k==='composite'){x.includeCompositeFoods=v==='1';x.updatedAt=Date.now()}
  return rr()}
 if(D.hreset){stop();const x=Core.ruleOf(HE(),D.hreset);if(x&&Core.resetToTemplate(x))root.toast('Proposition initiale rétablie');return rr()}
 if(D.hdel){stop();const h=HE(),x=Core.ruleOf(h,D.hdel);if(!x)return;if(Core.needsConfirm(x,'delete')&&!root.confirm('Cet aliment est enregistré comme exclusion stricte (allergie ou consigne médicale). Le retirer quand même ?'))return;Core.removeFood(h,D.hdel);S.hEdit=null;root.toast('Aliment retiré');return rr()}
 if(D.hswipe){stop();const h=HE(),x=h.foodRules.find(r=>r.status==='UNKNOWN');if(!x)return rr();if(D.hswipe==='SUGGESTED'){if(!Core.applySuggestion(x))return rr();return rr()}if(D.hswipe==='skip'){h.foodRules.splice(h.foodRules.indexOf(x),1);h.foodRules.push(x);x.skipped=(x.skipped||0)+1;
   if(h.foodRules.filter(r=>r.status==='UNKNOWN').every(r=>(r.skipped||0)>0)){h.foodRules.forEach(r=>{delete r.skipped});S.view='health'}}else Core.setStatus(x,D.hswipe);return rr()}
 if(D.hask){stop();const[id,a]=D.hask.split('|'),x=Core.ruleOf(HE(),id);if(!x)return;if(a==='edit'){S.view='health';S.hEdit=id;x.acceptCount=0}else if(a==='keep')Core.answerKeep(x);else Core.answerLater(x);return rr()}
 if(D.hwipe!==undefined){stop();if(!root.confirm('Supprimer toutes vos informations santé de cet appareil ?'))return;delete S.profile.health;S.hEdit=null;S.view='profile';cookRefresh();root.toast('Informations santé supprimées');return rr()}
},true);
/* Saisie : on met à jour les propositions sans tout redessiner (le clavier reste ouvert) */
app.addEventListener('input',e=>{const t=e.target,d=t&&t.dataset;if(!d)return;
 if(d.hcondq!==undefined){const box=app.querySelector('[data-hcondres]');if(box)box.innerHTML=condRes(t.value);return}
 if(d.hfoodq!==undefined){const box=app.querySelector('[data-hfoodres]');if(box)box.innerHTML=foodRes(t.value);return}});
app.addEventListener('change',e=>{const t=e.target,d=t&&t.dataset;if(!d||d.hfreqn===undefined)return;const x=Core.ruleOf(HE(),d.hfreqn);if(!x)return;const v=Math.max(0,Math.min(21,Math.round(Number(t.value)||0)));Core.setFrequency(x,{period:'week',maxOccurrences:v,mode:'max',custom:true});persist();root.toast(v===0?'Jamais':'Maximum '+v+' fois par semaine')});
/* Geste sur la carte aliment : droite = je tolère, gauche = je préfère éviter, haut = exclure, bas = j'en veux plus, toucher = détail */
let g=null;
app.addEventListener('pointerdown',e=>{const c=e.target.closest&&e.target.closest('.hcard');if(!c)return;g={c,x:e.clientX,y:e.clientY,dx:0,dy:0};try{c.setPointerCapture(e.pointerId)}catch(x){}});
app.addEventListener('pointermove',e=>{if(!g)return;g.dx=e.clientX-g.x;g.dy=e.clientY-g.y;g.c.style.transform=`translate(${g.dx}px,${g.dy}px) rotate(${g.dx/20}deg)`;g.c.dataset.dir=g.dy<-50&&Math.abs(g.dy)>Math.abs(g.dx)?'up':g.dy>50&&Math.abs(g.dy)>Math.abs(g.dx)?'down':g.dx>40?'right':g.dx<-40?'left':''});
function endG(){if(!g)return;const{c,dx,dy}=g;g=null;c.style.transform='';const dir=dy<-70&&Math.abs(dy)>Math.abs(dx)?'STRICT_EXCLUSION':dy>70&&Math.abs(dy)>Math.abs(dx)?'FAVOR':dx>60?'TOLERATED':dx<-60?'AVOID':null;
 if(dir){app.querySelector(`[data-hswipe="${dir}"]`)?.click();return}if(Math.abs(dx)<8&&Math.abs(dy)<8){S.hEdit=c.dataset.hcard;root.render()}}
app.addEventListener('pointerup',endG);app.addEventListener('pointercancel',()=>{if(g){g.c.style.transform='';g=null}});
app.addEventListener('keydown',e=>{const c=e.target.closest&&e.target.closest('.hcard');if(!c)return;const m={ArrowRight:'TOLERATED',ArrowLeft:'AVOID',ArrowUp:'STRICT_EXCLUSION',ArrowDown:'FAVOR'}[e.key];if(m){e.preventDefault();app.querySelector(`[data-hswipe="${m}"]`)?.click()}else if(e.key==='Enter'){S.hEdit=c.dataset.hcard;root.render()}});
})(typeof window!=='undefined'?window:globalThis);
