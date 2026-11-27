// Fiche Santé — profils sourcés dans la vraie app (STORE neuf).
const {R,T,click,H,ok,ERR,store}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await wait(1500);
 R('localStorage.setItem(K+"onboarded","true");state.profile.prepMeal=false;state.profile.mealprep="non";state.profile._mp="non";state.profile.midis=5;state.profile.soirs=5;save();state.view="health";render()');
 await click({'data-hcond':'coeliaque'});let h=T(H());
 ok(/Le régime sans gluten strict et à vie/.test(h)&&/Blé \(y compris épeautre, kamut\)/.test(h),'cœliaque : note et justification par aliment');
 ok((H().match(/target="_blank"/g)||[]).length>=3,'liens vers les sources (ameli, SNFGE, AFDIAG)');
 await click({'data-htpl':'coeliaque'});
 ok(R('state.view')==='healthSwipe'&&R('state.profile.health.foodRules.length')===15,'15 aliments ajoutés → tri par swipe');
 ok(R('state.profile.health.foodRules.every(r=>r.status==="UNKNOWN")'),'aucun n’est interdit automatiquement');
 h=T(H());ok(/Recommandation générale \(Maladie cœliaque\) : à exclure/.test(h)&&/Suivre la recommandation : à exclure/.test(h),'carte : recommandation affichée + bouton « Suivre la recommandation »');
 const first=R('state.profile.health.foodRules.find(r=>r.status==="UNKNOWN").foodOrFamilyId');
 await click({'data-hswipe':'SUGGESTED'});ok(R(`SRHealth.ruleOf(state.profile.health,${JSON.stringify(first)}).status`)==='STRICT_EXCLUSION',first+' : recommandation suivie sur geste');
 let g=0;while(R('state.view')==='healthSwipe'&&g++<30){const t=T(H());if(/Suivre la recommandation/.test(t))await click({'data-hswipe':'SUGGESTED'});else await click({'data-hswipe':'TOLERATED'});if(/C’est noté/.test(T(H())))break}
 ok(R('state.profile.health.foodRules.filter(r=>r.status==="STRICT_EXCLUSION").length')===11,'11 aliments avec gluten exclus, 4 laissés au choix (avoine, bouillons)');
 const ip=R('state.recipes.findIndex(r=>SRHealth.recipeFoods(r).foods.includes("pâtes"))');ok(R(`allowed(state.recipes[${ip}])`)===false,'recette avec pâtes : plus proposée');
 // toujours accessible + modifiable
 await click({'data-go':'health'});await click({'data-hcondopen':'coeliaque'});ok(/Tous ces aliments sont dans votre liste/.test(T(H())),'recommandations toujours consultables après coup');
 await click({'data-hedit':'pâtes'});h=T(H());ok(/recommandation générale : à exclure/.test(h)&&/ameli\.fr/.test(H()),'détail d’un aliment : recommandation + source');
 await click({'data-hset':'pâtes|status|TOLERATED'});ok(R('SRHealth.ruleOf(state.profile.health,"pâtes").status')==='TOLERATED','l’utilisateur peut quand même changer (origine profil général, sans confirmation)');
 ok(/Suivre la recommandation générale : à exclure/.test(T(H())),'… et revenir à la recommandation en un geste');
 await click({'data-hsugg':'pâtes'});await click({'data-hclose':''});
 // pause pour les MICI : seulement en poussée
 await click({'data-hcond':'crohn'});await click({'data-htpl':'crohn'});
 let k=0;while(R('state.view')==='healthSwipe'&&k++<40){if(/C’est noté/.test(T(H())))break;await click({'data-hswipe':'SUGGESTED'})}
 const il=R('state.recipes.findIndex(r=>{const f=SRHealth.recipeFoods(r).foods;return f.includes("lentilles corail")&&!f.some(x=>["pâtes","pain","semoule","farine","sauce soja","tortillas"].includes(x))})');
 const rl=`SRHealth.decide(state.recipes[${il}],state.profile.health,{}).action`;
 ok(R(rl)==='downrank'||R(rl)==='ok','crohn en poussée : lentilles « à limiter »');
 await click({'data-go':'health'});await click({'data-hcondon':'crohn'});ok(/En pause/.test(T(H())),'Crohn mis en pause (hors poussée)');
 ok(R('SRHealth.matches(state.recipes['+il+'],state.profile.health).filter(x=>x.foodOrFamilyId==="lentilles corail").length')===0,'hors poussée : les lentilles ne sont plus limitées');
 await click({'data-hcondon':'crohn'});ok(R('SRHealth.matches(state.recipes['+il+'],state.profile.health).some(x=>x.foodOrFamilyId==="lentilles corail")'),'nouvelle poussée : réactivation en un geste');
 await click({'data-hcondrm':'crohn'});ok(!!R('SRHealth.ruleOf(state.profile.health,"lentilles corail")'),'retirer Crohn : les choix déjà faits par l’utilisateur restent');
 ok(R('state.profile.health.conditions.length')===1,'cœliaque toujours là');
 ok(ERR.length===0,'0 erreur JavaScript'+(ERR.length?' : '+ERR.join(' | '):''));
})();
