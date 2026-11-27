// Fiche Santé — après rechargement (même STORE que t9) : tout reste modifiable, puis suppression totale.
const {R,T,click,H,ok,ERR,store}=require('./h.js');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{await wait(1500);
 ok(R('state.profile.health.foodRules.length')===4,'rechargement : fiche santé retrouvée');
 R('state.view="profile";render()');await click({'data-go':'health'});
 for(const[id,s]of[['tomates','TOLERATED'],['oignon','AVOID'],['ail','STRICT_EXCLUSION']]){await click({'data-hedit':id});await click({'data-hset':`${id}|status|${s}`});await click({'data-hclose':''})}
 ok(R('state.profile.health.foodRules.map(r=>r.status).join()')==='TOLERATED,AVOID,TOLERATED,STRICT_EXCLUSION','statuts modifiés après enregistrement');
 await click({'data-hedit':'oignon'});await click({'data-hset':'oignon|freq|custom'});ok(/fois par semaine/.test(T(H())),'fréquence personnalisée');
 await click({'data-hset':'oignon|origin|MEDICAL_INSTRUCTION'});await click({'data-hset':'oignon|warn|0'});await click({'data-hset':'oignon|derived|1'});
 const o=R('JSON.stringify(SRHealth.ruleOf(state.profile.health,"oignon"))');const O=JSON.parse(o);
 ok(O.origin==='MEDICAL_INSTRUCTION'&&O.warningBeforeSelection===false&&O.includeDerivedForms===true&&O.frequency.custom,'origine, avertissement, options : modifiables');
 ok(/pas encore reliés/.test(T(H())),'formes dérivées : clairement « pas encore reliées »');
 await click({'data-hclose':''});await click({'data-hcondrm':'crohn'});ok(R('state.profile.health.conditions.length')===0,'situation retirée');
 R('window.confirm=()=>false');await click({'data-hwipe':''});ok(!!R('state.profile.health'),'suppression totale : demande confirmation');
 R('window.confirm=()=>true');await click({'data-hwipe':''});
 ok(R('state.profile.health')===undefined&&!('health' in JSON.parse(store['sr517_profile'])),'toutes les informations santé supprimées de l’appareil');
 ok(R('state.profile.people')===2&&R('state.profile.soirs')===5,'le reste du profil est intact');
 ok(ERR.length===0,'0 erreur JavaScript'+(ERR.length?' : '+ERR.join(' | '):''));
})();
