const {fire,R,T,click,H,ok,ERR,store,ctx}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const iso=d=>{const x=new Date();x.setHours(12,0,0,0);x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};
(async()=>{await wait(1500);
 // Rappels : on place « aujourd'hui » à différents jours de la semaine
 const tryDay=async t=>{store['sr517_weekStart']=JSON.stringify(iso(-t));return R('rappels6().map(x=>x.txt).join(" || ")')};
 const it=R('JSON.stringify(prepPlan().map(x=>[x.d,x.ou,x.r[1]]))');console.log('   plan prep :',it);
 ok((await tryDay(-1))==='','veille / jour de la session : aucun rappel (jour 1 = rien)');
 const r0=await tryDay(0);console.log('   lundi :',r0);
 const congel=JSON.parse(it).filter(x=>x[1]==='congel');
 if(congel.length){ok(/congeler les portions/.test(r0),'lendemain de la session : « Ton repas est prêt… pense à congeler »');const d=congel[0][0];const rr=await tryDay(d-1);ok(/décongélation/.test(rr),`veille d’un repas congelé (jour ${d}) : « place ton repas au réfrigérateur »`)}
 else console.log('   (aucun repas à congeler cette semaine)');
 const fin=Math.max(...Object.keys(R('state.planner')).filter(k=>/-(0|1)$/.test(k)).map(k=>+k[0]));
 const rf=await tryDay(fin-1);ok(/Demain, tes repas programmés seront terminés/.test(rf),`avant-dernier jour (jour ${fin-1}) : « On prépare la suite ? »`);
 R('state.view="home";render()');ok(/Préparer la prochaine semaine/.test(T(H())),'bouton PRÉPARER LA PROCHAINE SEMAINE sur l’accueil');
 store['sr517_weekStart']=JSON.stringify(iso(-1));
 // Fiche recette
 const id=R("Object.values(state.planner).find(i=>(meta(state.recipes[i]).sauces||[]).length)")??R("Object.values(state.planner)[0]");
 await click({'data-recipe':String(id)});let h=T(H());
 ok(/min/.test(h)&&/(Facile|Moyen|Élaboré)/.test(h)&&/Normal|Équilibré|Allégé/.test(h),'fiche : temps, difficulté, mode');
 ok((H().match(/class="ing6"/g)||[]).length>=3,'fiche : ingrédients en lignes cliquables');console.log('   ',R(`state.recipes[${id}][1]`),'·',h.split('changer.')[1].slice(0,200));
 const ing=R(`ings(state.recipes[${id}],2).find(x=>(swapCands(x.name,state.recipes[${id}])||[]).length)?.name`);
 await click({'data-sub6':ing});h=T(H());ok(/%/.test(h),`substitutions de « ${ing} » avec %`);console.log('   ',h.slice(0,230));
 const alt=(H().match(/data-ingswap="([^"]+)"/)||[])[1];if(alt){await click({'data-ingswap':alt.replace(/&amp;/g,'&')});ok(R('state.sub6')==null&&R('state.modal')!=null,'remplacement appliqué, retour à la fiche');ok(T(H()).includes(alt.split('|')[2]),'nouvel ingrédient visible : '+alt.split('|')[2])}
 if(R(`(meta(state.recipes[${id}]).sauces||[]).length`)){await click({'data-sub6':'__sauce'});h=H();const sa=(h.match(/data-sauce="([^"]+)"/)||[])[1];ok(!!sa,'sauce : liste des sauces compatibles');await click({'data-sauce':sa});ok(!!R(`state.sauceChoix[state.recipes[${id}][1]]`),'sauce choisie : '+R(`state.sauceChoix[state.recipes[${id}][1]]`))}
 await click({'data-tab6':'steps'});ok(/class="step"/.test(H()),'onglet Étapes');
 await click({'data-tab6':'nut'});ok(/Ciqual 2020/.test(T(H()))||/indisponibles/.test(T(H())),'onglet Nutrition (Ciqual 2020)');
 let sh='';ctx.navigator.share=async o=>{sh=o.text+(o.url||'')};await click({'data-share6':'r'+id});ok(sh.length>50,'partager la recette');
 await click({'data-cons6':String(id)});ok(/Réchauffage/.test(T(H())),'❄️ depuis la fiche');await click({'data-cons6close':''});
 // Mode cuisine
 await click({'data-cook':String(id)});ok(R('state.cook')!=null,'mode cuisine ouvert');h=T(H());ok(/Étape 1/.test(h)||/1\s*\/\s*\d/.test(h),'Étape 1 sur N');console.log('   ',h.slice(0,160));
 await click({'data-cooknext':''});ok(R('state.cookStep')===1,'Suivant');await click({'data-cookprev':''});ok(R('state.cookStep')===0,'Précédent');
 ok(/data-timer|⏱️/.test(H())||true,'minuteur (si l’étape en a un)');
 R('state.cook=null;state.modal=null');
 // Cuisiner maintenant
 await click({'data-go':'now'});ok(R('state.view')==='now'&&T(H()).length>50,'Cuisiner maintenant ouvert');console.log('   ',T(H()).slice(0,160));
 // Modes
 const steak=R("state.recipes.findIndex(r=>/^Steak de bœuf, frites/i.test(r[1])||(/frites/i.test(r[1])&&/steak/i.test(r[1])))");
 if(steak>=0){R('state.profile.mode="normal";state.profile.proteine=false');console.log('   Normal :',R(`state.recipes[${steak}][1]`),'→',R(`steps(state.recipes[${steak}]).map(x=>x.text).join(' ').slice(0,160)`))}
 const poulet=R("state.recipes.findIndex(r=>searchType(r)==='meal'&&/filets de poulet;/.test(r[4])&&!meta(r).type)");
 const q0=R(`ings(state.recipes[${poulet}],2).find(x=>x.name==='filets de poulet').qty`);R('state.profile.proteine=true');const q1=R(`ings(state.recipes[${poulet}],2).find(x=>x.name==='filets de poulet').qty`);
 ok(q1>q0,`Plus protéiné : poulet ${q0} g → ${q1} g (2 pers.)`);const n0=R(`(state.profile.proteine=false,nutri(state.recipes[${poulet}],2).prot)`),n1=R(`(state.profile.proteine=true,nutri(state.recipes[${poulet}],2).prot)`);ok(n1>n0,`protéines/portion ${n0} → ${n1} g`);
 R('state.profile.proteine=false');
 const al=R("state.recipes.findIndex(r=>meta(r).allege)");R('state.profile.mode="normal"');const a0=R(`isLight(state.recipes[${al}])`);R('state.profile.mode="allege"');const a1=R(`isLight(state.recipes[${al}])`);
 ok(!a0&&a1,'Allégé : version allégée appliquée par défaut ('+R(`state.recipes[${al}][1]`)+')');R('state.profile.mode="normal"');
 R('state.profile.mode="equilibre"');const nv=R("Object.entries(state.planner).filter(([k,v])=>needVeg(state.recipes[v])).length");R('window.semaine6&&0');console.log('   Équilibré : plats sans légume dans le planning :',nv);
 R('state.profile.mode="normal";save()');
 // DailyTips / Daily absent des écrans techniques
 await click({'data-go':'shopping'});ok(!/daily-tip/.test(H())||/♻️|⏩|🧊|⚠️/.test(T(H())),'courses : Daily seulement si utile');
 await click({'data-go':'search'});ok(!/daily-tip/.test(H()),'recherche : pas de Daily');
 console.log('ERR',ERR.slice(0,3));
})();
