const {fire,R,T,click,H,ok,ERR,store,ctx}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await wait(1500);
 ok(Object.keys(R('state.planner')).length===9,'rechargement : planning conservé (9 repas)');
 await click({'data-go':'planning'});let h=H();
 const k=Object.keys(R('state.planner')).find(x=>x.endsWith('-1'));const d=Number(k[0]);
 await click({'data-day6':String(d)});ok(R('state.dayIdx')===d,'changer de jour');
 await click({'data-row6':k});h=T(H());ok(/Ouvrir/.test(h)&&/Changer/.test(h)&&/Déplacer/.test(h)&&/Supprimer/.test(h)&&/Cuisiner/.test(h),'ligne de repas : Ouvrir / Cuisiner / Changer / Déplacer / Supprimer');
 console.log('   infos :',T(H().split('meal6-info')[1]||'').slice(0,220));
 // Déplacer
 const id=R(`state.planner['${k}']`);const target=(d+3)%7;ctx.__prompt=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'][target];
 await click({'data-move6':k});ok(R(`state.planner['${target}-1']`)===id,'déplacer vers un autre jour');
 // Supprimer + Ajouter
 await click({'data-del6':target+'-1'});ok(R(`state.planner['${target}-1']`)===undefined,'supprimer un repas');
 await click({'data-add6':String(target)});ok(/data-slotadd/.test(H()),'ajouter : choix des créneaux (midi, soir, dessert, smoothie, eau…)');
 console.log('   créneaux :',T(H().split('add6')[1]||'').slice(0,200));
 // Changer (fonction d'origine)
 const k2=Object.keys(R('state.planner')).find(x=>x.endsWith('-0'));await click({'data-change':k2});ok(['replaceSwipe','planning'].includes(R('state.view')),'changer → '+R('state.view'));
 await click({'data-go':'planning'});
 // ❄️
 const fz=R(`Object.values(state.planner).find(i=>{try{return consJours(state.recipes[i],true)>0}catch(e){return false}})`);
 await click({'data-cons6':String(fz)});h=T(H());ok(/Réfrigérateur/.test(h)&&/Congélation/.test(h)&&/Réchauffage/.test(h),'❄️ fiche conservation : '+R(`state.recipes[${fz}][1]`));console.log('   ',h.split('Conservation')[1].slice(0,330));
 await click({'data-cons6close':''});
 // Semaine 2
 R("state.profile.semaines=2");await click({'data-wk6':'1'});ok(R('state.wk')===1&&Object.keys(R('state.planner')).length===0,'Semaine 2 : planning séparé (vide)');
 ok(/Semaine 1/.test(T(H()))&&/Semaine 2/.test(T(H())),'onglets Semaine 1 | Semaine 2');
 R("state.planner['2-2']=state.recipes.findIndex(r=>searchType(r)==='dessert');state.planner['2-4']=state.recipes.findIndex(r=>searchType(r)==='energy');state.planner['2-3']=state.recipes.findIndex(r=>searchType(r)==='detox');save()");
 await click({'data-day6':'2'});h=T(H());ok(/Dessert/.test(h)&&/Smoothie/.test(h)&&/Eau aromatisée/.test(h),'jour : Dessert, Smoothie, Eau');
 await click({'data-wk6':'0'});ok(Object.keys(R('state.planner')).length===8,'retour Semaine 1 intacte');
 ok(JSON.parse(store['sr517_planner2']||'{}')['2-2']!=null,'Semaine 2 enregistrée');
 // Partage semaine
 let shared='';ctx.navigator.share=async o=>{shared=o.text};await click({'data-share6':'semaine'});ok(/Ma semaine SwipeRepas/.test(shared)&&/Soir/.test(shared),'partager la semaine');
 // Courses
 await click({'data-validateplanning':''});ok(R('state.view')==='shopping','valider → courses');h=T(H());ok(h.length>300,'liste de courses affichée');console.log('   courses :',h.slice(0,250));
 const ck=(H().match(/data-check="([^"]+)"/)||[])[1];if(ck){for(const t of ['change','input'])await fire(t,{check:ck},{checked:true});ok(Object.keys(R('state.shopping.checked')).length>0,'cocher un article')}else ok(false,'case à cocher trouvée');
 ok(/data-share|partag/i.test(H()),'partage de la liste présent');
 console.log('ERR',ERR.slice(0,3));
})();
