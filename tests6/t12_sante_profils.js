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
 // endométriose : favoriser
 await click({'data-go':'health'});await click({'data-hcond':'endometriose'});let he=T(H());
 ok(/Niveau de preuve : limité/.test(he)&&/anti-inflammatoire/.test(he)&&/à favoriser/.test(he),'endométriose : alimentation anti-inflammatoire, aliments « à favoriser », niveau de preuve affiché');
 await click({'data-htpl':'endometriose'});ok(R('state.view')==='healthSwipe','tri des aliments de l’endométriose');
 await click({'data-go':'health'});await click({'data-hcondopen':'endometriose'});
 const nb=R('state.profile.health.foodRules.filter(r=>r.status==="UNKNOWN"&&(SRHealth.suggestionOf(r)||{}).suggested==="FAVOR").length');
 ok(nb>0&&/Appliquer d’un coup : \d+ à favoriser, \d+ à éviter ou limiter/.test(T(H())),'bouton « Appliquer d’un coup » ('+nb+' à favoriser)');
 ok(/Adapter mes recettes/.test(T(H()))&&R('state.profile.health.cookAdapt')===true,'cuisine anti-inflammatoire activée en chargeant le profil (réglage visible, modifiable)');
 await click({'data-hfavall':'endometriose'});ok(R('state.profile.health.foodRules.filter(r=>r.status==="UNKNOWN"&&(SRHealth.suggestionOf(r)||{}).suggested==="FAVOR").length')===0,'favorisés en un geste');
 ok(R('SRHealth.ruleOf(state.profile.health,"bœuf haché").status')==='AVOID'&&R('SRHealth.ruleOf(state.profile.health,"bœuf haché").frequency.maxOccurrences')===2,'bœuf haché : à éviter, 2 fois par semaine maximum (pas supprimé)');
 ok(R('state.profile.health.foodRules.filter(r=>r.templateId==="endometriose"&&r.status==="STRICT_EXCLUSION").length')===0,'aucune exclusion stricte');
 const ib=R('state.recipes.findIndex(r=>r[1]==="Blanquette de veau"&&/crème/.test(r[4]))');ok(ib>=0&&/huile d’olive/.test(R(`state.recipes[${ib}][4]`))&&/cuisine anti-inflammatoire/.test(R(`adapteNote(state.recipes[${ib}])`)),'blanquette adaptée dans l’app, avec la note sur la fiche recette');
 await click({'data-hcook':'0'});ok(/beurre;/.test(R(`state.recipes[${ib}][4]`)),'« Non » : recette d’origine');await click({'data-hcook':'1'});ok(/huile d’olive/.test(R(`state.recipes[${ib}][4]`)),'« Oui » : recette adaptée');
 await click({'data-go':'healthSwipe'});
 ok(/J’en veux plus|C’est noté/.test(T(H())),'tri : tout est déjà décidé ou le bouton « J’en veux plus » est là');
 let e=0;while(R('state.view')==='healthSwipe'&&e++<80){if(/C’est noté/.test(T(H())))break;if(/Suivre la recommandation/.test(T(H())))await click({'data-hswipe':'SUGGESTED'});else await click({'data-hswipe':'TOLERATED'})}
 const nf=R('state.profile.health.foodRules.filter(r=>r.status==="FAVOR").length');ok(nf>=35,nf+' aliments en « J’en veux plus souvent » (les choix déjà faits pour cœliaque et Crohn sont gardés)');
 await click({'data-go':'health'});ok(/J’en veux plus souvent · \d+/.test(T(H())),'liste : groupe « J’en veux plus souvent »');
 const sw=R('(()=>{const h=state.profile.health,pool=state.recipes.filter(r=>allowed(r)),rich=r=>SRHealth.decide(r,h,{}).favorShare>=0.45,pct=l=>l.filter(rich).length/l.length;let top=0;for(let i=0;i<60;i++)top+=pct(SRHealth.applyPool(pool,h,{}).slice(0,60));return Math.round(top/60*100)+"/"+Math.round(pct(pool)*100)})()');
 const [fv,bs]=sw.split('/').map(Number);ok(fv>=bs*1.25,'vraies recettes : '+fv+' % de plats très riches en aliments favorisés dans les 60 premiers (catalogue : '+bs+' %)');
 ok(ERR.length===0,'0 erreur JavaScript'+(ERR.length?' : '+ERR.join(' | '):''));
})();
