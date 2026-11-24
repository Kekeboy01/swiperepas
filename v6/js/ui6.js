/* SwipeRepas 6.0.0 — nouvelle interface Terracotta.
   Couche posée PAR-DESSUS app.js (5.60.0) : aucune fonction existante n'est supprimée.
   Les écrans redessinés appellent les fonctions d'origine (planning, courses, prep meal, briques, sauces, anti-gaspi…).
   Les anciennes versions restent disponibles sous le nom <fonction>0. */
(function(){
const J=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'],JC=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const P=()=>state.profile;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const saveKey=(k,v)=>localStorage.setItem(K+k,JSON.stringify(v));

/* ---------- Daily : bibliothèque (master + tenues + poses), pas de thème automatique ---------- */
const DPOSE={coucou:'poses/daily-saluer',base:'master/daily-master',montre:'poses/daily-pointer',lit:'conseils/daily-conseils',prof:'poses/daily-reflechir',saluer:'poses/daily-saluer',reflechir:'poses/daily-reflechir',pointer:'poses/daily-pointer',cuisiner:'poses/daily-cuisiner',applaudir:'poses/daily-applaudir',conseils:'conseils/daily-conseils','anti-gaspi':'anti-gaspi/daily-anti-gaspi'};
window.DAILY6=DPOSE;
const dsrc=p=>`./assets/daily/${DPOSE[p]||'master/daily-master'}.png`;
window.dailyFig=function(pose){return `<img class="daily-fig" src="${dsrc(pose)}" alt="Daily">`};
window.feteBox=function(){return ''};            /* thèmes et fêtes : bibliothèque seulement, non activés */
const dailySay0=window.dailySay;window.dailySay0=dailySay0;
/* Daily n'intervient que s'il apporte quelque chose : silence sur la recherche, le garde-manger, le swipe et les courses,
   sauf message utile (anti-gaspi, avance, conservation, alerte). */
window.dailySay=function(pose,html){const utile=/⏩|✅|♻️|🧊|⚠️|⏱️ <b>Ce planning|Demain|Pense à/.test(html||'');const muet=['search','pantry','swipe','replaceSwipe','shopping','profile'].includes(state.view)||state.cook!=null;if(muet&&!utile)return '';return `<div class="daily-tip">${window.dailyFig(pose)}<p>${html}</p></div>`};
const tip=(html,pose='conseils')=>`<div class="daily-tip small">${window.dailyFig(pose)}<p>${html}</p></div>`;

/* ---------- Profil : valeurs par défaut des nouveaux réglages (sans écraser l'existant) ---------- */
function profil6(){const p=P();let ch=false;const d=(k,v)=>{if(p[k]===undefined){p[k]=v;ch=true}};
 /* la présentation de Daily (objectif, meal prep) reste la source : si elle change, le profil suit */
 if(p.goal!==p._goal){p.mode=p.goal==='leger'?'allege':p.goal==='equilibre'?'equilibre':'normal';p.proteine=p.goal==='muscle';p._goal=p.goal;ch=true}
 if(p.mealprep!==p._mp){p.prepMeal=p.mealprep==='oui';p._mp=p.mealprep;ch=true}d('prepRepas',3);d('semaines',1);d('midis',5);d('soirs',5);d('desserts',0);d('smoothies',0);d('eaux',0);
 if(ch)save();}
window.profil6=profil6;

/* ---------- Deux semaines : un planning par semaine, l'app d'origine travaille sur la semaine affichée ---------- */
state.plans=[state.planner,load('planner2',{})];state.peoples=[state.plannerPeople||{},load('plannerPeople2',{})];state.wk=0;
/* save() d'app.js est une constante : la semaine 2 est enregistrée après chaque affichage (et avant de quitter la page) */
function garde2(){if(state.wk!==1)return;saveKey('planner2',state.planner);saveKey('plannerPeople2',state.plannerPeople||{});saveKey('planner',state.plans[0]);saveKey('plannerPeople',state.peoples[0]||{})}
window.garde6=garde2;try{addEventListener('pagehide',garde2);addEventListener('beforeunload',garde2)}catch(e){}
function semaine(w){if(w===state.wk)return;state.plans[state.wk]=state.planner;state.peoples[state.wk]=state.plannerPeople;state.wk=w;state.planner=state.plans[w]||{};state.plannerPeople=state.peoples[w]||{};}
window.semaine6=semaine;
function lundi(){let s=load('weekStart','');if(!s){const t=new Date();t.setHours(12);const k=(t.getDay()+6)%7;t.setDate(t.getDate()-k);s=t.toISOString().slice(0,10);saveKey('weekStart',s)}return new Date(s+'T12:00:00')}
function dateDe(w,d){const x=lundi();x.setDate(x.getDate()+w*7+d);return x}
const aujourd=()=>{const t=new Date();t.setHours(12,0,0,0);return t};
function idxAujourdhui(){return Math.round((aujourd()-lundi())/864e5)}

/* ---------- Modes : Normal (classique), Équilibré, Allégé, Plus protéiné (combinable) — À VALIDER ---------- */
const MODES=[['normal','Normal'],['equilibre','Équilibré'],['allege','Allégé']];
const modeNom=()=>(MODES.find(m=>m[0]===P().mode)||MODES[0])[1]+(P().proteine?' · + protéines':'');
const isLight0=window.isLight;window.isLight0=isLight0;
window.isLight=function(r){curR=r;const i=state.recipes.indexOf(r);if(P().mode==='allege'&&meta(r).allege&&state.light[i]!==false)return true;return isLight0(r)};
/* Plus protéiné : la portion de protéine principale des plats passe à +25 % (À VALIDER). ings() d'app.js est une constante :
   on agit dans roundQty(), qu'elle appelle juste après isLight(r) pour chaque ingrédient. Les condiments (lardons, chorizo, anchois) ne bougent pas. */
let curR=null;
const roundQty0=window.roundQty;window.roundQty0=roundQty0;
window.roundQty=function(e,q,u){const r=curR;if(P().proteine&&r&&e&&e.c==='p'&&!['lardons','chorizo','anchois'].some(n=>ING[n]===e)&&searchType(r)==='meal'&&meta(r).type!=='brique')q=q*1.25;return roundQty0(e,q,u)};
/* Équilibré : le légume proposé par Daily est ajouté d'office (salade verte) aux plats sans légume */
function equilibre(){if(P().mode!=='equilibre')return;for(const id of Object.values(state.planner)){const r=state.recipes[id];if(r&&needVeg(r)&&!state.sides[r[1]]&&sideOk('salade'))state.sides[r[1]]='salade'}saveKey('sides',state.sides)}

/* ---------- Petites aides d'affichage ---------- */
function difficulte(r){const n=steps(r).length,t=Number(r[2])||0;return n<=5&&t<=35?'Facile':n<=8&&t<=75?'Moyen':'Élaboré'}
/* accompagnement affiché sous le nom : seulement s'il apporte une info (pas déjà dans le titre, pas de farine/chapelure) */
function accomp(r){const titre=norm(r[1]),neuf=x=>!titre.includes(norm(x).split(' ')[0]);const b=(meta(r).briques||[]).slice(1).filter(x=>!/^(Sauce|Huile|Assaisonnement)/.test(x)).map(court).filter(neuf);if(b.length)return b.slice(0,2).join(' · ');
 const L=String(r[4]).split('|').map(x=>x.split(';')[0]).filter(n=>ING[n]&&ING[n].c==='f'&&!/farine|chapelure|fécule|maïzena|panure|levure/.test(n)&&neuf(n));return L.slice(0,2).join(' · ')}
function congelable(r){if(!r)return false;try{return consJours(r,true)>0&&searchType(r)==='meal'}catch(e){return false}}
const flocon=(r,where)=>congelable(r)?`<button class="flake" data-cons6="${state.recipes.indexOf(r)}" aria-label="Conservation">❄️</button>`:'';

/* ---------- Partage (navigateur) ---------- */
async function partager(titre,texte,url){try{if(navigator.share){await navigator.share({title:titre,text:texte,url});return}}catch(e){if(e&&e.name==='AbortError')return}
 try{await navigator.clipboard.writeText(texte+(url?'\n'+url:''));toast('Copié : colle-le où tu veux')}catch(e){toast('Partage indisponible sur cet appareil')}}
function texteSemaine(){const lignes=[];for(let d=0;d<7;d++){const L=[['0','Midi'],['1','Soir'],['2','Dessert'],['4','Smoothie'],['3','Eau']].map(([s,l])=>{const id=state.planner[d+'-'+s];return id==null?null:`  ${l} : ${state.recipes[id][1]}`}).filter(Boolean);if(L.length)lignes.push(`${J[d]} ${dateDe(state.wk,d).getDate()}\n`+L.join('\n'))}return `🗓️ Ma semaine SwipeRepas (semaine ${state.wk+1})\n\n`+lignes.join('\n\n')}

/* ---------- Rappels de Daily (calculés sur les vraies dates du planning) ---------- */
function rappels(){const out=[],t=idxAujourdhui();
 const derniers=[0,1].map(w=>{const pl=w===state.wk?state.planner:state.plans[w]||{};let m=-1;for(const k of Object.keys(pl)){const d=Number(k.split('-')[0]);if(/-(0|1)$/.test(k))m=Math.max(m,d+w*7)}return m});const fin=Math.max(...derniers);
 try{const pr=state.prep||{};if((pr.done||pr.bases)&&state.wk===0){const it=prepPlan();const sess=[...new Set(it.map(x=>x.s).filter(x=>x!=null))];
  for(const s of sess){if(t===s+1&&it.some(x=>x.s===s&&x.ou==='congel'))out.push({txt:'Ton repas est prêt. Si ce n’est pas encore fait, pense à congeler les portions prévues pour plus tard.',pose:'pointer'})}
  for(const x of it){if(x.ou==='congel'&&t===x.d-1)out.push({txt:`Pense à placer ton repas au réfrigérateur pour sa décongélation : ${x.r[1]} (demain).`,pose:'pointer'})}}}catch(e){}
 if(fin>=0&&t===fin-1)out.push({txt:'Demain, tes repas programmés seront terminés. On prépare la suite ?',pose:'saluer',btn:'<button class="btn" data-go6="semaine-suivante">Préparer la prochaine semaine</button>'});
 return out}
window.rappels6=rappels;

/* ---------- Accueil : 3 actions ---------- */
const home0=window.home;window.home0=home0;
window.home=function(){profil6();const R=rappels(),G=gainsMois();
 return `<section class="home6"><div class="brand6"><img src="./assets/icons/icon-192.png" alt=""><b>SwipeRepas</b></div>
 <div class="hello6"><img class="daily-hero6" src="${dsrc('saluer')}" alt="Daily"><div><h1>Bonjour !</h1><p>Que faisons-nous aujourd’hui ?</p></div></div>
 ${R.map(x=>tip(x.txt+(x.btn?`<br>${x.btn}`:''),x.pose)).join('')}
 <div class="actions6">
  <button class="act6" data-go6="preparer"><span>🗓️</span><b>Préparer ma semaine</b><small>${P().prepMeal?'Avec le prep meal':'Daily organise avec toi'}</small></button>
  <button class="act6" data-go="now"><span>🍳</span><b>Cuisiner maintenant</b><small>Avec ce que tu as</small></button>
  <button class="act6" data-go6="semaine"><span>📖</span><b>Reprendre · Ma semaine</b><small>${Object.keys(state.planner).length?'Ton planning est prêt':'Pas encore de planning'}</small></button>
 </div>${G.min>=5?`<p class="muted center">⏱️ Ce mois-ci : ≈ ${minTxt(G.min)} gagnées${G.g>=50?` · ≈ ${G.g} g de nourriture sauvés`:''}</p>`:''}
 ${typeof histAsk==='function'?histAsk():''}</section>`};

/* ---------- Navigation : 5 onglets ---------- */
const nav0=window.nav;window.nav0=nav0;
window.nav=function(){const it=[['home','🏠','Accueil'],['planning','🗓️','Semaine'],['now','🍳','Cuisiner'],['shopping','🛒','Courses'],['profile','👤','Profil']];
 const cur=state.view==='weekSetup'||state.view==='prep'||state.view==='prep6'||state.view==='swipe'?'planning':['search','pantry','nowCheck'].includes(state.view)?'now':state.view;
 return `<nav class="nav6">${it.map(([v,e,l])=>`<button data-go="${v}" class="${cur===v?'on':''}"><span>${e}</span>${l}</button>`).join('')}</nav>`};
const topBar0=window.topBar;window.topBar0=topBar0;
window.topBar=function(){return `<div class="top6"><button class="toplogo" data-go="home" aria-label="Accueil"><img src="./assets/icons/icon-192.png" alt=""><span>SwipeRepas</span></button><button class="top6-search" data-go="search" aria-label="Rechercher">🔎</button></div>`};

/* ---------- Profil : la mémoire de SwipeRepas ---------- */
const profile0=window.profile;window.profile0=profile0;
window.profile=function(){profil6();const p=P();const sec=(id,titre,html)=>`<details class="sec6" ${state.secOpen===id?'open':''} data-sec="${id}"><summary>${titre}</summary><div>${html}</div></details>`;
 const n=(k,lab,min,max)=>`<div class="row6"><span>${lab}</span><div class="stepper"><button data-pnum="${k}|-1">−</button><b>${p[k]}</b><button data-pnum="${k}|1">+</button></div></div>`;
 const f=(k,l)=>`<div class="field"><label>${l}</label><input data-prof="${k}" value="${esc((p[k]||[]).join(', '))}"></div>`;
 const opt=(k,list)=>`<div class="seg6">${list.map(([v,l])=>`<button class="${String(p[k])===String(v)?'on':''}" data-popt="${k}|${v}">${l}</button>`).join('')}</div>`;
 return `<h1 class="h6">Mon profil</h1><p class="muted">Ce que tu règles ici, Daily s’en souvient : il ne te repose plus les questions chaque semaine.</p>
 ${sec('foyer','👪 Mon foyer',n('people','Personnes habituelles',1,12)+`<div class="field"><label>Allergies</label>${dChips('allergies',ALLERG,true)}</div><div class="field"><label>Régime / interdictions</label>${dChips('diet',DIETS,false)}</div><div class="field"><label>Personnes à protéger (cuissons)</label>${dChips('sensible',SENSIBLE,true)}</div>`)}
 ${sec('gouts','😋 Mes goûts',f('loved','J’aime')+f('disliked','Je n’aime pas'))}
 ${sec('semaine','🗓️ Ma semaine habituelle',n('midis','Midis',0,7)+n('soirs','Soirs',0,7)+n('desserts','Desserts',0,7)+n('smoothies','Smoothies',0,7)+n('eaux','Eaux aromatisées',0,7)+`<div class="row6"><span>Planifier</span>${opt('semaines',[[1,'1 semaine'],[2,'2 semaines']])}</div>`)}
 ${sec('orga','🍱 Mon organisation',`<div class="row6"><span>Prep meal</span>${opt('prepMeal',[[true,'Oui'],[false,'Non']])}</div>${p.prepMeal?`<div class="row6"><span>Repas par base</span>${opt('prepRepas',[[2,'2 repas'],[3,'3 repas']])}</div>`:''}<div class="row6"><span>Temps pour cuisiner</span>${opt('cookTime',[[20,'20 min'],[30,'30 min'],[45,'45 min'],[60,'1 h']])}</div>`)}
 ${sec('cuisine','🔥 Ma cuisine',`<div class="field">${dChips('equipment',['Four','Plaques','Friteuse','Airfryer','Wok','Micro-ondes','Robot','Mixeur','Cuiseur vapeur'],true)}</div>`)}
 ${sec('modes','🎯 Mes objectifs · modes',`${opt('mode',MODES)}<div class="row6"><span>Plus protéiné</span>${opt('proteine',[[true,'Oui'],[false,'Non']])}</div><p class="muted small">Normal = les recettes classiques telles quelles (frites à la friteuse comprises). Les adaptations ne s’appliquent qu’en Équilibré, Allégé ou Plus protéiné.</p><div class="field"><label>Maximum de kcal par repas (facultatif)</label><input type="number" min="200" max="2000" step="50" data-dkcal value="${p.kcalMax||''}" placeholder="ex. 600"></div><div class="field"><label>Niveau en cuisine</label>${dChips('niveau',NIVEAUX,false)}</div>`)}
 <div class="actions"><button class="btn secondary" data-dailyagain>Refaire la présentation avec Daily</button><button class="btn secondary" data-go="pantry">🥫 Mon garde-manger</button></div>
 <details class="sec6"><summary>Tous les réglages (ancienne page)</summary><div>${profile0()}</div></details>`};

/* ---------- Préparer ma semaine : sans questions déjà connues ---------- */
function semaineDepuisProfil(){const p=P(),w=state.week;w.midMeals=p.midis;w.midOn=p.midis>0;w.eveMeals=p.soirs;w.eveOn=p.soirs>0;w.midPeople=w.evePeople=p.people||2;w.desserts=p.desserts;w.energy=p.smoothies;w.detox=p.eaux;if(p.cookTime)w.time=Math.max(20,Number(p.cookTime));}
/* la semaine préparée commence le lundi qui vient (ou aujourd'hui si on est lundi) : c'est la base des rappels de Daily */
function debutSemaine(){if(state.wk!==0)return;const t=aujourd(),k=(t.getDay()+6)%7;if(k)t.setDate(t.getDate()+7-k);saveKey('weekStart',t.toISOString().slice(0,10))}
function preparer(){profil6();semaineDepuisProfil();debutSemaine();if(P().prepMeal){state.p6={step:'base',n:0,bases:[],refus:[]};state.view='prep6'}else{state.view='weekSetup';state.weekStep=99}render();window.scrollTo(0,0)}
window.preparer6=preparer;

/* ---------- Prep meal 6.0 : swipe de bases → 2 ou 3 repas → 2e base → swipe des plats → planning ---------- */
function basesDispo(){const out=[];for(const f of prepFamilles())out.push({id:f.id,titre:f.base.replace(' (base de prep)',''),emoji:f.emoji,plats:f.plats.slice(0,3)});
 const seen=new Set();for(const f of quickGroups().values()){const pr=court(f.p);if(seen.has(pr))continue;seen.add(pr);out.push({id:f.id,titre:f.base,emoji:'🍲',plats:f.plats.slice(0,3)});if(out.length>=12)break}return out}
function prep6(){const s=state.p6||{step:'base',bases:[],refus:[]};const B=basesDispo().filter(b=>!s.bases.some(x=>x.id===b.id)&&!s.refus.includes(b.id));
 const nb=s.bases.length;
 if(s.step==='n'){const b=basesDispo().find(x=>x.id===s.cur);return `<section class="prep6">${tip('Pour combien de repas veux-tu utiliser cette base ?','reflechir')}<h1 class="h6 center">${b.emoji} ${esc(b.titre)}</h1><div class="actions6 two">${[2,3].map(n=>`<button class="act6 ${Number(P().prepRepas)===n?'on':''}" data-p6n="${n}"><b>${n} repas</b></button>`).join('')}</div><p class="muted center small">Rien n’est imposé : tu choisis à chaque fois.</p></section>`}
 if(s.step==='fin'||nb>=2)return lancerPlats();
 const b=B[0];if(!b)return `<section class="prep6 center">${tip(nb?'Je n’ai pas d’autre base à te proposer. On continue avec ta base.':'Je n’ai plus de base compatible avec ton profil.','reflechir')}<button class="btn" data-p6fin>${nb?'Continuer':'Préparer ma semaine sans prep meal'}</button></section>`;
 const r0=state.recipes[b.plats[0]];
 return `<section class="prep6"><p class="eyebrow6">${nb===0?'Première base':'Deuxième base'}</p><article class="base6"><div class="base6-img"><img src="${img(r0)}" alt=""></div><h1>${esc(b.titre)}</h1><p class="muted">Une base, plusieurs repas</p><p class="small6">Par exemple, elle peut devenir :</p><div class="ideas6">${b.plats.map(i=>{const r=state.recipes[i];return `<div><img src="${img(r)}" alt=""><span>${esc(r[1])}</span></div>`}).join('')}</div></article>
 <div class="swipe-actions"><button class="round no" data-p6="no" aria-label="Non">✕</button><button class="round yes" data-p6="yes" aria-label="Oui">❤</button></div>
 ${nb===1?'<button class="chip center-block" data-p6fin>Pas de deuxième base</button>':''}</section>`}
window.prep6=prep6;window.basesDispo6=basesDispo;
function lancerPlats(){const s=state.p6;state.p6={...s,step:'lance'};
 const ids=s.bases.map(b=>b.id),n=s.bases.reduce((t,b)=>t+b.n,0);
 state.prep={repas:state.week.eveMeals>0?'eve':'mid',jour:'dim',bases:ids.join(','),choix:ids.join(','),done:false,soupe:!!(state.week.potage||state.week.potageMid)};saveKey('prep',state.prep);
 state.p6base={ids,n};startWeek();
 /* les plats des bases vont d'abord sur les soirs, le surplus sur les midis ; jamais plus que les repas prévus */
 const w=state.week,nEve=Math.min(n,w.eveMeals||0),nMid=Math.min(n-nEve,w.midMeals||0),pre=[];
 for(const[slot,c]of[['eve',nEve],['mid',nMid]]){if(!c)continue;const reg=state.phases.find(x=>x.type==='meal'&&x.slot===slot);if(reg)reg.count=Math.max(0,reg.count-c);pre.push({label:'🍱 Les plats de tes bases',slot,type:'prepdish',count:c,people:slot==='eve'?w.evePeople:w.midPeople})}
 state.prep.repas=nMid?'both':nEve?'eve':'mid';saveKey('prep',state.prep);
 state.phases=[...pre,...state.phases.filter(x=>x.count>0)];state.phaseIndex=0;loadPhase();return swipe()}
const phasePool0=window.phasePool;window.phasePool0=phasePool0;
window.phasePool=function(p){if(p&&p.type==='prepdish'){const ids=(state.p6base||{}).ids||[];const out=[];for(const id of ids){const f=id.startsWith('q:')?quickGroups().get(id):prepFamilles().find(x=>x.id===id);if(f)for(const i of f.plats){const r=state.recipes[i];if(r&&allowed(r))out.push(r)}}return out}return phasePool0(p)};
const loadPhase0=window.loadPhase;window.loadPhase0=loadPhase0;
window.loadPhase=function(){const p=state.phases[state.phaseIndex],prev=state.phases[state.phaseIndex-1];
 if(prev&&prev.type==='prepdish'&&prev.pris===undefined){prev.pris=state.saved.filter(x=>x.type==='prepdish'&&x.slot===prev.slot).length;const manque=prev.count-prev.pris;if(manque>0){const reg=state.phases.slice(state.phaseIndex).find(x=>x.type==='meal'&&x.slot===prev.slot);if(reg)reg.count+=manque;else state.phases.splice(state.phaseIndex,0,{label:prev.slot==='eve'?'🌙 Tes soirs':'☀️ Tes midis',slot:prev.slot,type:'meal',count:manque,people:prev.people})}}
 const r=loadPhase0.apply(this,arguments);if(!state.phases[state.phaseIndex]&&state.view==='planning'){equilibre();state.dayIdx=0}return r};

/* ---------- Planning : Semaine 1 | Semaine 2, la journée comme unité ---------- */
const LIGNES=[['0','☀️','Midi'],['6','🥣','Soupe du midi'],['1','🌙','Soir'],['5','🥣','Soupe du soir'],['2','🍰','Dessert'],['4','🥤','Smoothie'],['3','💧','Eau aromatisée']];
const planning0=window.planning;window.planning0=planning0;
window.planning=function(){profil6();const d=state.dayIdx??Math.max(0,Math.min(6,state.wk===0?idxAujourdhui():0));state.dayIdx=d;const date=dateDe(state.wk,d);
 const deux=P().semaines>=2||Object.keys(state.plans[1]||{}).length;
 const lignes=LIGNES.map(([s,e,l])=>{const key=d+'-'+s,id=state.planner[key],r=id==null?null:state.recipes[id];if(!r)return '';const open=state.rowOpen===key;
  const sub=s==='0'||s==='1'?accomp(r):'';const infos=(()=>{let h='';try{const pi=prepInfo(key),ri=pi?'':resteInfo(key);h+=(pi?`<p>${pi}</p>`:ri?`<p>${ri}</p>`:'')+sideLine(r)+(state.sauceChoix[r[1]]&&(meta(r).sauces||[]).includes(state.sauceChoix[r[1]])?`<p>🥣 Avec : ${state.sauceChoix[r[1]].toLowerCase()}</p>`:'')+avanceLine(key)+(state.ag&&state.ag.key===key&&state.ag.id===id?`<p>♻️ Composé de tes restes${state.ag.prend&&state.ag.prend.length?' : '+state.ag.prend.join(', '):''} · si un produit a dépassé sa date limite (DLC), ne fais pas ce repas.</p>`:'')}catch(e){}return h})();
  return `<div class="meal6 ${open?'open':''}"><button class="meal6-main" data-row6="${key}"><span class="meal6-ico">${e}</span><span class="meal6-txt"><small>${l}</small><b>${esc(r[1])}</b>${sub?`<i>${esc(sub)}</i>`:''}</span></button>${flocon(r)}
  ${open?`<div class="meal6-more">${infos?`<div class="meal6-info">${infos}</div>`:''}<div class="chips"><button class="chip" data-recipe="${id}">Ouvrir</button>${s==='0'||s==='1'?`<button class="chip" data-cook="${id}" data-cookkey="${key}">Cuisiner</button>`:''}<button class="chip" data-change="${key}">Changer</button><button class="chip" data-move6="${key}">Déplacer</button><button class="chip" data-del6="${key}">Supprimer</button></div></div>`:''}</div>`}).join('');
 const R=rappels(),g=gainsSemaine(),vide=!Object.keys(state.planner).length;
 return `<div class="plan6"><div class="weeks6">${deux?`<div class="seg6"><button class="${state.wk===0?'on':''}" data-wk6="0">Semaine 1</button><button class="${state.wk===1?'on':''}" data-wk6="1">Semaine 2</button></div>`:'<h1 class="h6">Ma semaine</h1>'}<button class="chip" data-share6="semaine" aria-label="Partager">📤</button></div>
 <div class="days6">${JC.map((x,i)=>{const n=Object.keys(state.planner).filter(k=>k.startsWith(i+'-')).length;return `<button class="${i===d?'on':''} ${n?'has':''}" data-day6="${i}">${x}<small>${dateDe(state.wk,i).getDate()}</small></button>`}).join('')}</div>
 ${R.map(x=>tip(x.txt+(x.btn?`<br>${x.btn}`:''),x.pose)).join('')}
 ${!vide&&state.wk===0&&state.prep&&state.prep.bases&&!state.prep.done?tip('Ta session prep meal est prévue dimanche. Je te guide étape par étape.<br><button class="btn" data-go="prep">Voir ma session prep</button>','cuisiner'):''}
 ${vide?`<div class="empty6">${tip('Ton planning est vide. On le prépare ensemble ?','saluer')}<button class="btn" data-go6="preparer">Préparer ma semaine</button></div>`:`<div class="dayhead6"><h2>${J[d]} ${date.getDate()}</h2><button class="chip" data-add6="${d}">+ Ajouter</button></div>
 <div class="day6">${lignes||'<p class="muted">Rien de prévu ce jour-là.</p>'}</div>${state.addOpen===d?`<div class="add6">${slotChips(d)}</div>`:''}
 ${g.total>=5?`<p class="gain6">⏱️ Ce planning te fait gagner ≈ ${minTxt(g.total)}${g.sauve?` · ♻️ ≈ ${g.sauve} g de restes utilisés`:''}</p>`:''}
 ${state.week.antigaspi?surplusBox():''}`}
 <div class="actions plan6-actions"><button class="btn secondary" data-autoplan>✨ Générer</button><button class="btn secondary" data-go="prep">🍱 Préparer à l’avance</button>${vide?'':'<button class="btn" data-validateplanning>✅ Valider et faire les courses</button>'}</div>
 <details class="sec6"><summary>Vue complète de la semaine</summary><div>${planning0()}</div></details></div>`};

/* ---------- Fiche recette : photo, nom, temps, difficulté, mode, puis lignes d'ingrédients ---------- */
const modal0=window.modal;window.modal0=modal0;
window.modal=function(i){const r=state.recipes[i];if(!r)return '';const p=state.week.evePeople||P().people||2,tab=state.tab6||'ing';
 if(state.sub6)return sheetSub(r,i);if(state.cons6!=null)return sheetCons(state.recipes[state.cons6]);
 const L=ings(r,p),ms=(meta(r).sauces||[]),sc=state.sauceChoix[r[1]];
 const lignes=L.map(x=>`<button class="ing6" data-sub6="${esc(x.name)}"><span>${esc(x.name)}</span><b>${fmt(x.qty)} ${x.unit}</b><i>›</i></button>`).join('')+(ms.length?`<button class="ing6" data-sub6="__sauce"><span>Sauce${sc?' : '+esc(sc.toLowerCase()):''}</span><b>${sc?'Changer':'Ajouter'}</b><i>›</i></button>`:'');
 const st=(()=>{const seen=new Set(),seenA=new Set();return steps(r).map((x,n)=>`<div class="step"><span>${n+1}</span><div><p>${stepHTML(x.text,seen)}</p>${astuceFor(x.text,seenA)}${x.timer?`<button class="chip" data-timer="${x.timer}" data-tnext="${escA((steps(r)[n+1]||{}).text||'C’est prêt, régale-toi !')}" data-tname="${escA(r[1])}">⏱️ ${x.timer} min</button>`:''}</div></div>`).join('')})();
 const nu=nutri(r,p);const nut=nu?`<div class="nut6"><div><b>${nu.kcal}</b><small>kcal</small></div><div><b>${nu.prot} g</b><small>protéines</small></div><div><b>${nu.gluc} g</b><small>glucides</small></div><div><b>${nu.lip} g</b><small>lipides</small></div></div><p class="muted small">Par portion · Ciqual 2020 (Anses).</p>`:'<p class="muted">Valeurs nutritionnelles indisponibles pour cette recette (on n’invente pas).</p>';
 const tipTxt=(()=>{const s0=steps(r).map(x=>x.text).join(' ');if(meta(r).sauces&&!sc)return 'Une petite sauce irait bien avec ce plat : touche « Sauce ».';if(needVeg(r))return 'Ce plat n’a pas de légume : une salade verte l’accompagne bien.';if(/70 °C/.test(s0))return 'Pour la viande, fie-toi au signe de cuisson : 70 °C au centre.';return ''})();
 const extra=[accBox(r),briqueNote(r),soupeBox(r),prepBox(r),rapideBox(r),briquesBox(r),variantesBox(r,i),dailyAlt(r),safetyBox(r),adapteNote(r),lightBox(r,i)].join('');
 return `<div class="modal"><article class="sheet sheet6"><button class="close6" data-close aria-label="Fermer">✕</button><img class="hero" src="${img(r)}" alt="">
 <h1>${esc(r[1])}</h1><p class="meta6"><span>⏱️ ${r[2]} min</span><span>🔪 ${difficulte(r)}</span><span>🎯 ${modeNom()}</span>${flocon(r)}</p>
 ${meta(r).attention?`<p class="muted">⚠️ ${meta(r).attention}</p>`:''}
 <div class="tabs6"><button class="${tab==='ing'?'on':''}" data-tab6="ing">Ingrédients</button><button class="${tab==='steps'?'on':''}" data-tab6="steps">Étapes</button><button class="${tab==='nut'?'on':''}" data-tab6="nut">Nutrition</button></div>
 ${tab==='ing'?`<p class="muted small">Pour ${p} personne(s)${P().proteine&&searchType(r)==='meal'?' · plus protéiné (+25 % de protéine)':''} · touche un ingrédient pour le changer.</p><div class="ings6">${lignes}</div>`:tab==='steps'?st:nut}
 ${tipTxt?tip(tipTxt):''}
 <div class="bar6"><button data-cons6="${i}">❄️<small>Conservation</small></button><button data-share6="r${i}">📤<small>Partager</small></button><button data-add6r="${i}">＋<small>Ajouter</small></button></div>
 <button class="btn wide" data-cook="${i}">Commencer à cuisiner</button>
 ${extra?`<details class="sec6"><summary>Conseils et infos</summary><div>${extra}</div></details>`:''}
 <details class="sec6"><summary>Plus d’actions</summary><div class="actions"><button class="btn secondary" data-read="${i}">🔊 Lire</button><button class="btn secondary" data-cooked="${i}">✅ Je l’ai cuisiné</button><button class="btn secondary" data-copyrecipe="${i}">📋 Copier</button><button class="btn secondary" data-recipelink="${i}">🔗 Lien</button></div></details><div data-shortbox></div></article></div>`};
/* Substitutions triées selon le contexte de la recette (ordre du moteur ; le calcul reste interne) */
function sheetSub(r,i){const name=state.sub6;
 if(name==='__sauce'){const ms=(meta(r).sauces||[]).map(sauceIdx).filter(k=>k>=0&&!allergyHit(state.recipes[k]).length);const sc=state.sauceChoix[r[1]];
  return `<div class="modal"><article class="sheet sheet6"><button class="close6" data-sub6back aria-label="Retour">←</button><h2>Changer la sauce</h2><div class="ings6">${ms.map((k,n)=>{const s=state.recipes[k],nu=nutri(s,4);return `<button class="ing6 ${sc===s[1]?'on':''}" data-sauce="${encodeURIComponent(r[1])}|${k}"><span>${esc(s[1])}</span><b>${nu?'≈ '+nu.kcal+' kcal':''}</b><i>${sc===s[1]?'✓':'›'}</i></button>`}).join('')}${sc?`<button class="ing6" data-sauce="${encodeURIComponent(r[1])}|${sauceIdx(sc)}"><span>Sans sauce</span><b></b><i>›</i></button>`:''}</div>${tip('La sauce change tout le plat : ces sauces s’accordent bien avec cette recette.')}</article></div>`}
 const c=swapCands(name,r)||[];const pct=n=>Math.max(55,96-[0,5,9,14,18,22,26,30,34,38][Math.min(n,9)]);
 const dis=(P().disliked||[]).some(d=>norm(name).includes(norm(d)));
 return `<div class="modal"><article class="sheet sheet6"><button class="close6" data-sub6back aria-label="Retour">←</button><h2>Changer ${esc(name)}</h2>
 ${c.length?`<p class="muted small">Meilleures alternatives</p><div class="ings6">${c.slice(0,8).map((x,n)=>`<button class="ing6" data-ingswap="${i}|${esc(name)}|${esc(x)}"><span>${esc(x)}</span><b>${pct(n)} %</b><i>›</i></button>`).join('')}</div>${tip('Ces alternatives s’accordent bien avec cette recette.')}`:'<p class="muted">Je n’ai pas de remplacement sûr pour celui-là.</p>'}
 <div class="chips"><button class="chip ${dis?'on':''}" data-ingpref="${i}|${esc(name)}|disliked">👎 Je n’aime pas</button><button class="chip" data-ingpref="${i}|${esc(name)}|loved">❤️ J’adore</button>${(meta(r).echanges||[]).some(e=>e[1]===name)?`<button class="chip" data-ingreset="${i}">↩️ Revenir à la recette d’origine</button>`:''}</div></article></div>`}
/* ❄️ Conservation : propre à chaque recette (éléments, durées de l'app) */
function sheetCons(r){if(!r)return '';let j=0;try{j=consJours(r,true)}catch(e){}const fz=typeof prepFreezable==='function'?prepFreezable(r):true;const riz=/riz;/.test(r[4]);
 return `<div class="modal"><article class="sheet sheet6"><button class="close6" data-cons6close aria-label="Fermer">✕</button><h2>❄️ Conservation</h2><p class="muted">${esc(r[1])}</p>
 <div class="cons6"><div><b>🧊 Réfrigérateur</b><p>${j>0?`${j} jour${j>1?'s':''} au plus, dans une boîte fermée, au frigo dans les 2 heures après la cuisson.`:'À manger le jour même : ne se garde pas.'}${riz?' Le riz se garde à part, 24 h au plus.':''}</p></div>
 <div><b>❄️ Congélation</b><p>${fz&&j>0?'Possible : congèle les portions prévues pour plus tard, le jour même.':'Déconseillée pour ce plat.'}</p></div>
 ${fz&&j>0?`<div><b>🌙 Décongélation</b><p>La veille, au réfrigérateur (jamais à température ambiante), puis à manger dans les 24 h.</p></div>`:''}
 <div><b>🔥 Réchauffage</b><p>Bien chaud partout, une seule fois.</p></div>
 ${j<=1?`<div><b>⏳ Priorité</b><p>À manger en premier dans la semaine.</p></div>`:''}</div>${consBox(r)}</article></div>`}

/* ---------- Swipe : visuel et gourmand, sans fiche technique ---------- */
const swipe0=window.swipe;window.swipe0=swipe0;
window.swipe=function(){let h=swipe0();const r=state.deck[state.deckIndex];if(!r)return h;const i=state.recipes.indexOf(r);
 try{const si=swipeIngs(r);if(si)h=h.replace(si,'')}catch(e){}
 h=h.replace(`<h2>${r[1]}</h2>`,`<h2>${r[1]}</h2><p class="acc6">${esc(accomp(r))}</p><p class="meta6"><span>⏱️ ${r[2]} min</span><span>🔪 ${difficulte(r)}</span><span>🎯 ${modeNom()}</span></p>`);
 h=h.replace(/<p class="muted">⏱️[\s\S]*?<\/p>/,'');/* la fiche technique (kcal, macros) reste dans « Voir la recette » */
 h=h.replace('<div class="swipe-extra">',`<div class="swipe-extra"><button class="chip" data-recipe="${i}">📖 Voir la recette</button>`);
 return h};

/* ---------- Routeur : nouvelle vue prep6 ---------- */
const render0=window.render;window.render0=render0;
window.render=function(){try{if(state.view==='prep6'&&state.cook==null){if(state.recipes&&state.recipes.length)adaptAll();app.innerHTML=topBar()+prep6()+nav()+(state.modal!=null?modal(state.modal):'');return}return render0.apply(this,arguments)}finally{garde2()}};

/* ---------- Clics de la nouvelle interface (avant ceux d'app.js) ---------- */
app.addEventListener('click',e=>{const b=e.target.closest('button,summary');if(!b)return;const D=b.dataset,stop=()=>{e.stopPropagation();e.preventDefault()};
 if(b.tagName==='SUMMARY'){const d=b.parentElement;if(d&&d.dataset.sec){setTimeout(()=>{state.secOpen=d.open?d.dataset.sec:null},0)}return}
 if(D.go6){stop();if(D.go6==='preparer')return preparer();if(D.go6==='semaine'){state.view='planning';render();return}if(D.go6==='semaine-suivante'){semaine(0);preparer();return}}
 if(D.go==='planning'||D.go==='home'||D.go==='now'||D.go==='shopping'||D.go==='profile'){state.modal=null;state.sub6=null;state.cons6=null}
 if(D.p6){stop();const s=state.p6,b0=basesDispo().filter(x=>!s.bases.some(y=>y.id===x.id)&&!s.refus.includes(x.id))[0];if(!b0)return render();if(D.p6==='no')s.refus.push(b0.id);else{s.cur=b0.id;s.step='n';s.prepRepas=P().prepRepas}render();return}
 if(D.p6n){stop();const s=state.p6;s.bases.push({id:s.cur,n:Number(D.p6n)});s.step=s.bases.length>=2?'fin':'base';render();window.scrollTo(0,0);return}
 if(D.p6fin!==undefined){stop();const s=state.p6;if(!s.bases.length){P().prepMeal=false;save();state.view='weekSetup';state.weekStep=99;render();return}s.step='fin';render();return}
 if(D.wk6){stop();semaine(Number(D.wk6));state.dayIdx=0;state.rowOpen=null;render();return}
 if(D.day6){stop();state.dayIdx=Number(D.day6);state.rowOpen=null;state.addOpen=null;render();return}
 if(D.row6){stop();state.rowOpen=state.rowOpen===D.row6?null:D.row6;render();return}
 if(D.add6!==undefined){stop();state.addOpen=state.addOpen===Number(D.add6)?null:Number(D.add6);render();return}
 if(D.del6){stop();delete state.planner[D.del6];if(state.plannerPeople)delete state.plannerPeople[D.del6];state.rowOpen=null;save();toast('Retiré du planning');render();return}
 if(D.move6){stop();const k=D.move6,s=k.split('-')[1],raw=prompt('Déplacer vers quel jour ? (lundi, mardi…)');if(!raw)return;const di=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'].findIndex(x=>norm(raw).includes(x));if(di<0)return toast('Jour non reconnu');const k2=di+'-'+s,a=state.planner[k],b2=state.planner[k2];state.planner[k2]=a;if(b2!=null)state.planner[k]=b2;else delete state.planner[k];save();state.dayIdx=di;state.rowOpen=k2;toast(b2!=null?'Repas échangés':'Repas déplacé');render();return}
 if(D.cons6!==undefined){stop();if(state.modal==null)state.modal=Number(D.cons6);state.cons6=Number(D.cons6);render();return}
 if(D.cons6close!==undefined){stop();state.cons6=null;if(state.view==='planning'&&state.consFromPlan)state.modal=null;render();return}
 if(D.tab6){stop();state.tab6=D.tab6;render();return}
 if(D.sub6){stop();state.sub6=D.sub6;render();return}
 if(D.sub6back!==undefined){stop();state.sub6=null;render();return}
 if(D.ingswap||D.sauce){state.sub6=null}
 if(D.recipe!==undefined){state.tab6='ing';state.sub6=null;state.cons6=null}
 if(D.add6r!==undefined){stop();program(Number(D.add6r));return}
 if(D.share6){stop();if(D.share6==='semaine')return partager('Ma semaine',texteSemaine());const i=Number(D.share6.slice(1));return partager(state.recipes[i][1],recipeText(i),recipeLink(i))}
 if(D.pnum){stop();const[k,dv]=D.pnum.split('|'),lim={people:[1,12]}[k]||[0,7];P()[k]=Math.max(lim[0],Math.min(lim[1],(Number(P()[k])||0)+Number(dv)));if(k==='people')syncPeople&&syncPeople();save();render();return}
 if(D.popt){stop();const[k,v]=D.popt.split('|');P()[k]=v==='true'?true:v==='false'?false:isNaN(v)?v:Number(v);if(k==='prepMeal'){P().mealprep=P().prepMeal?'oui':'non';P()._mp=P().mealprep}if(k==='mode'){P().goal=v==='allege'?'leger':v==='equilibre'?'equilibre':P().proteine?'muscle':'plaisir';P()._goal=P().goal}if(k==='proteine'&&P().mode==='normal'){P().goal=P().proteine?'muscle':'plaisir';P()._goal=P().goal}if(k==='cookTime')state.week.time=Math.max(20,Number(v));save();render();return}
},true);

/* ---------- Démarrage ---------- */
try{profil6();document.querySelector('meta[name=theme-color]')?.setAttribute('content','#D8613F')}catch(e){}
})();
