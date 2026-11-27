// Fiche Santé — parcours dans la vraie app (app.js + ui6.js + health.js, vraies données). Lancer AVANT t10 (même STORE).
const {R,T,click,H,ok,ERR,store}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const prof=()=>JSON.parse(store['sr517_profile']||'{}');
(async()=>{await wait(1500);
 R('localStorage.setItem(K+"onboarded","true");state.profile.prepMeal=false;state.profile.mealprep="non";state.profile._mp="non";state.profile.midis=5;state.profile.soirs=5;state.profile.desserts=0;state.profile.people=2;save();state.view="profile";render()');
 ok(/Santé & tolérances/.test(T(H()))&&/data-go="health"/.test(H()),'Profil : entrée « Santé & tolérances »');
 ok(!('health' in prof()),'aucune donnée santé créée tant que l’utilisateur n’ouvre pas la fiche');
 await click({'data-go':'health'});let h=T(H());
 ok(R('state.view')==='health','écran Santé & tolérances');
 ok(/ne remplacent pas un avis médical/.test(h)&&/médecin ou diététicien/.test(h),'avertissement médical visible');
 ok(/Rechercher une situation de santé…/.test(H()),'barre « Rechercher une situation de santé… »');
 ok(/Essayer le tri par swipe/.test(h),'démo proposée quand la fiche est vide');
 await click({'data-hcond':'crohn'});
 ok(R('state.profile.health.conditions[0].templateStatus')==='VERIFIED_TEMPLATE'&&R('state.profile.health.foodRules.length')===0,'Maladie de Crohn ajoutée : recommandations disponibles, aucun aliment imposé');
 ok(/Pendant une poussée seulement/.test(T(H()))&&/ameli\.fr/.test(H())&&/Ajouter ces 15 aliments à vérifier/.test(T(H())),'recommandations visibles tout de suite, avec sources et bouton d’ajout');
 await click({'data-hcond':'endometriose'});ok(/données sont insuffisantes pour recommander un régime/.test(T(H())),'endométriose : l’app dit honnêtement qu’aucun régime n’est recommandé (HAS)');
 await click({'data-hcondrm':'endometriose'});
 await click({'data-hcondon':'crohn'});ok(R('state.profile.health.conditions[0].enabled')===false,'situation désactivable');
 await click({'data-hcondon':'crohn'});
 // aliments
 await click({'data-hfood':'tomates'});
 ok(R('state.hEdit')==='tomates'&&/Pourquoi cet aliment est présenté/.test(T(H())),'ajout de « tomates » : fiche de détail ouverte');
 ok(R('SRHealth.ruleOf(state.profile.health,"tomates").status')==='UNKNOWN','arrive en « À vérifier pour moi »');
 await click({'data-hset':'tomates|status|LIMIT'});ok(/À quelle fréquence/.test(T(H())),'« À limiter » : question de fréquence');
 await click({'data-hset':'tomates|freq|max1'});await click({'data-hclose':''});
 ok(R('JSON.stringify(SRHealth.ruleOf(state.profile.health,"tomates").frequency)')==='{"period":"week","maxOccurrences":1,"mode":"max"}','fréquence 1 fois par semaine enregistrée');
 await click({'data-hfood':'oignon'});await click({'data-hset':'oignon|status|STRICT_EXCLUSION'});await click({'data-hclose':''});
 const P=prof();ok(P.health&&P.health.foodRules.length===2&&P.health.foodRules[1].status==='STRICT_EXCLUSION','enregistré dans le profil (stockage de l’appareil)');
 ok(/Exclusion stricte · 1/.test(T(H()))&&/À limiter · 1/.test(T(H())),'liste groupée par statut');
 // moteur : exclusion stricte partout
 const io=R('state.recipes.findIndex(r=>SRHealth.recipeFoods(r).foods.includes("oignon"))');
 ok(io>=0&&R(`allowed(state.recipes[${io}])`)===false,'recette avec oignon : refusée partout (recherche, planning, swipe)');
 const it=R('state.recipes.findIndex(r=>SRHealth.recipeFoods(r).foods.includes("tomates")&&!SRHealth.recipeFoods(r).foods.includes("oignon"))');
 ok(R(`allowed(state.recipes[${it}])`)===true,'recette avec tomates (limitée, pas exclue) : toujours possible');
 // swipe de la semaine
 await click({'data-go6':'preparer'});await click({'data-startweek':''});ok(R('state.view')==='swipe','swipe des repas');
 let warn=false,n=0;while(R('state.view')==='swipe'&&n++<400){if(/Contient : tomates/.test(T(H())))warn=true;await click({'data-swipe':'yes'})}
 const sv=R('JSON.stringify(state.saved.map(s=>({f:SRHealth.recipeFoods(state.recipes[s.id]).foods,rep:s.rep||1})))');const S=JSON.parse(sv);
 const tomN=S.filter(s=>s.f.includes('tomates')).reduce((a,s)=>a+s.rep,0);
 ok(R('state.view')==='planning'&&S.length>0,'fin du swipe → planning ('+S.length+' plats)');
 ok(tomN<=1,'limite respectée : '+tomN+' plat(s) avec tomates sur la semaine (max 1)');
 ok(!S.some(s=>s.f.includes('oignon')),'aucun plat avec oignon');
 ok(warn||tomN===0,'avertissement « Contient : tomates » sur la carte avant de choisir');
 // allergie protégée
 await click({'data-go':'health'});await click({'data-hfood':'lait'});await click({'data-hset':'lait|status|STRICT_EXCLUSION'});await click({'data-hset':'lait|origin|ALLERGY'});
 R('window.confirm=()=>false');await click({'data-hset':'lait|status|TOLERATED'});
 ok(R('SRHealth.ruleOf(state.profile.health,"lait").status')==='STRICT_EXCLUSION','allergie stricte : pas modifiée sans confirmation');
 await click({'data-hdel':'lait'});ok(!!R('SRHealth.ruleOf(state.profile.health,"lait")'),'allergie stricte : pas retirée sans confirmation');
 R('window.confirm=()=>true');await click({'data-hset':'lait|status|AVOID'});
 ok(R('SRHealth.ruleOf(state.profile.health,"lait").status')==='AVOID','avec confirmation : modifiable quand même');
 await click({'data-hdel':'lait'});ok(!R('SRHealth.ruleOf(state.profile.health,"lait")'),'retirable');
 // swipe des aliments
 await click({'data-hfood':'ail'});await click({'data-hclose':''});await click({'data-hfood':'poivrons'});await click({'data-hclose':''});
 ok(/Trier 2 aliments en quelques swipes/.test(T(H())),'bouton « Trier en quelques swipes »');
 await click({'data-go':'healthSwipe'});h=T(H());
 ok(/ail/.test(h)&&/Je préfère éviter/.test(h)&&/Exclure/.test(h)&&/Je tolère/.test(h)&&/hcard/.test(H()),'carte aliment + 3 boutons visibles');
 await click({'data-hswipe':'skip'});ok(/poivrons/.test(T(H()).split('Je préfère')[0]),'« Décider plus tard » passe à l’aliment suivant');
 await click({'data-hswipe':'TOLERATED'});await click({'data-hswipe':'AVOID'});
 ok(R('SRHealth.ruleOf(state.profile.health,"poivrons").status')==='TOLERATED'&&R('SRHealth.ruleOf(state.profile.health,"ail").status')==='AVOID','swipe : droite = je tolère, gauche = je préfère éviter');
 ok(/C’est noté/.test(T(H())),'fin du tri');
 // apprentissage : question, jamais de modification seule
 const ia=R('state.recipes.findIndex(r=>SRHealth.recipeFoods(r).foods.includes("ail")&&allowed(r))');
 R(`state.view='swipe';state.phases=[{label:'t',slot:'eve',type:'meal',count:20,people:2}];state.phaseIndex=0;state.phasePicked=0;state.saved=[];state.deck=[0,1,2,3,4].map(()=>state.recipes[${ia}]);state.deckIndex=0;render()`);
 for(let i=0;i<3;i++)await click({'data-swipe':'yes'});
 ok(R('SRHealth.ruleOf(state.profile.health,"ail").status')==='AVOID','3 plats acceptés avec ail : réglage inchangé');
 R('state.view="home";render()');h=T(H());ok(/Vous acceptez régulièrement les plats contenant ail/.test(h)&&/Me redemander plus tard/.test(h),'accueil : Daily pose la question (3 boutons)');
 await click({'data-hask':'ail|later'});R('render()');ok(!/Vous acceptez régulièrement/.test(T(H())),'« plus tard » : question masquée');
 // désactiver
 await click({'data-go':'health'});await click({'data-henable':'0'});ok(R(`allowed(state.recipes[${io}])`)===true,'fiche désactivée : plus aucun effet');
 await click({'data-henable':'1'});ok(R(`allowed(state.recipes[${io}])`)===false,'réactivée');
 ok(ERR.length===0,'0 erreur JavaScript'+(ERR.length?' : '+ERR.join(' | '):''));
})();
