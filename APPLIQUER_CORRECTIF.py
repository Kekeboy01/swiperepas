from pathlib import Path
root=Path(__file__).resolve().parent
patch=root/'js'/'patch5140.js'
index=root/'index.html'
if not patch.exists(): raise SystemExit('Fichier js/patch5140.js introuvable. Copie ce correctif dans la racine du depot.')
s=patch.read_text(encoding='utf-8')
blocks=[
"function dedupeDeck(){if(!state?.deck?.length)return;const seen=new Set(),skip=new Set(pdata().skipNext||[]);state.deck=state.deck.filter(r=>{const id=state.recipes.indexOf(r),s=sig(r);if(skip.has(id)||seen.has(s))return false;seen.add(s);return true})}\n",
"if(typeof searchNow==='function'){const oldSearchNow=searchNow;searchNow=function(){oldSearchNow();dedupeDeck()}}\n",
"if(typeof loadPhase==='function'){const oldLoad=loadPhase;loadPhase=function(){oldLoad();dedupeDeck()}}\n"]
for b in blocks:s=s.replace(b,'')
old="function autoFill(){const days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];let mi=0,si=0;"
new="function autoFill(){const d=pdata();if(!d.lunchAsked){const exact=confirm('Le midi, veux-tu toujours un type précis de repas ?\\n\\nOK = type précis (ex. burrito)\\nAnnuler = repas variés');d.lunchMode=exact?'type':'varied';if(exact)d.lunchType=prompt('Quel type veux-tu le midi ? Ex. burrito, wrap, salade…')||'';d.lunchAsked=true;psave(d);if(exact&&!d.lunchType){toast('Indique un type de repas pour le midi');render();return}}const days=['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];let mi=0,si=0;"
if old in s:s=s.replace(old,new,1)
old2="const unique=[],seen=new Set();for(const id of a){const r=state.recipes[id],s=sig(r);if(r&&!seen.has(s)){seen.add(s);unique.push(id)}}return unique.sort((a,b)=>Number(used.has(a))-Number(used.has(b)))}"
new2="const unique=[],duplicates=[],seen=new Set();for(const id of a){const r=state.recipes[id],s=sig(r);if(!r)continue;(seen.has(s)?duplicates:unique).push(id);seen.add(s)}return [...unique,...duplicates].sort((a,b)=>Number(used.has(a))-Number(used.has(b)))}"
if old2 in s:s=s.replace(old2,new2,1)
patch.write_text(s,encoding='utf-8')
if index.exists():
 t=index.read_text(encoding='utf-8').replace('patch5140.js?v=5140','patch5140.js?v=5141').replace('Beta 5.14.0','Beta 5.14.1')
 index.write_text(t,encoding='utf-8')
print('Correctif 5.14.1 applique : swipe restaure et question burrito ajoutee.')
