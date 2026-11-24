const {R,T,click,H,ok,ERR,store}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await wait(1500);
 // 1. Onboarding
 ok(R('state.view')==='daily','premier lancement : présentation Daily');
 let guard=0;while(R('state.view')==='daily'&&guard++<20){const st=R('DSTEPS[state.dailyStep]');
  if(st==='habits'){await click({'data-dpick':'cookTime|30'});await click({'data-dpick':'mealprep|oui'})}
  if(st==='recap'){await click({'data-dfinish':''});break}
  await click({'data-dnext':''})}
 ok(R('state.view')==='home','fin de présentation → accueil');
 ok(store['sr517_onboarded']==='true','présentation mémorisée');
 const h=T(H());ok(/Préparer ma semaine/i.test(h)&&/Cuisiner maintenant/i.test(h)&&/Reprendre/i.test(h)&&/Que faisons-nous/.test(h),'accueil : 3 actions + phrase de Daily');
 ok(R('state.profile.prepMeal')===true,'choix « meal prep : oui » de la présentation → profil Prep meal OUI');
 ok((H().match(/data-go="/g)||[]).length>=5&&/nav6/.test(H()),'navigation 5 onglets');
 // 2. Profil
 await click({'data-go':'profile'});const ph=T(H());
 ok(['Mon foyer','Mes goûts','Ma semaine habituelle','Mon organisation','Ma cuisine','Mes objectifs'].every(s=>ph.includes(s)),'profil : 6 sections');
 ok(/Tous les réglages \(ancienne page\)/.test(ph),'ancienne page profil toujours accessible');
 await click({'data-pnum':'soirs|-1'});ok(R('state.profile.soirs')===4,'profil : soirs 5 → 4 enregistré');
 await click({'data-popt':'prepRepas|2'});ok(R('state.profile.prepRepas')===2,'profil : 2 repas par base');
 await click({'data-dtoggle':'equipment|Friteuse'});ok(R('state.profile.equipment').includes('Friteuse'),'profil : friteuse cochée');
 ok(JSON.parse(store['sr517_profile']).soirs===4,'profil écrit dans le stockage');
 console.log('ERR',ERR.slice(0,3));
})();
