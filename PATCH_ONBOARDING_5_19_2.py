from pathlib import Path
import shutil
root=Path(__file__).resolve().parent
app=root/'js'/'app.js'; css=root/'css'/'app.css'; idx=root/'index.html'
for f in (app,css,idx):
    if not f.exists(): raise SystemExit(f'Fichier manquant : {f}. Mets ce script dans la racine de Swipe Repas 5.19.1.')
for f in (app,css,idx): shutil.copy2(f,f.with_suffix(f.suffix+'.bak5191'))
s=app.read_text(encoding='utf-8')
if 'onboardDone' in s: raise SystemExit('Onboarding deja present. Aucun changement.')
# Add onboarding state, preserving existing profile data.
needle="const state={view:'home',recipes:[]"
if needle not in s: raise SystemExit('Structure state inconnue. Aucun changement.')
s=s.replace(needle,"const state={view:'home',recipes:[],onboardStep:0,onboardDone:load('onboardDone',false)",1)
# Persist completion flag.
needle="const save=()=>{"
if needle not in s: raise SystemExit('Fonction save introuvable.')
s=s.replace(needle,"const save=()=>{localStorage.setItem(K+'onboardDone',JSON.stringify(state.onboardDone));",1)
# Insert onboarding renderer before nav.
nav='function nav(){'
pos=s.find(nav)
if pos<0: raise SystemExit('Navigation introuvable.')
onboard=r'''const ONBOARD_SUG={allergies:['lait','œufs','arachides','fruits à coque','poisson','crustacés','soja','gluten','sésame'],loved:['poulet','pâtes','riz','pommes de terre','tomates','fromage','italien','asiatique','curry'],disliked:['champignons','fenouil','coriandre','aubergine','brocoli','épinards','poisson','tofu','olives']};
function onboardChips(k){return `<div class="chips">${ONBOARD_SUG[k].map(x=>`<button class="chip ${state.profile[k].includes(x)?'on':''}" data-obchip="${k}|${x}">${state.profile[k].includes(x)?'✓ ':''}${x}</button>`).join('')}</div>`}
function onboarding(){const n=state.onboardStep;let b='';if(n===0)b=`<h1>👋 Bienvenue dans Swipe Repas</h1><section class="panel"><span class="eyebrow">1/5 · FOYER</span><h2>Pour combien de personnes cuisines-tu ?</h2><input type="number" min="1" max="12" data-obpeople value="${state.profile.people}"></section>`;if(n===1)b=`<h1>🚫 Allergies et interdictions</h1><section class="panel"><span class="eyebrow">2/5 · SÉCURITÉ</span>${onboardChips('allergies')}<div class="field"><label>Ajouter plusieurs éléments</label><input data-obtext="allergies" value="${state.profile.allergies.join(', ')}" placeholder="Ex. lactose, cacahuètes, céleri"></div></section>`;if(n===2)b=`<h1>❤️ Ce que tu aimes</h1><section class="panel"><span class="eyebrow">3/5 · J’AIME</span>${onboardChips('loved')}<div class="field"><label>Ajoute autant de goûts que tu veux</label><input data-obtext="loved" value="${state.profile.loved.join(', ')}" placeholder="Ex. poulet, curry, cuisine italienne"></div></section>`;if(n===3)b=`<h1>👎 Ce que tu n’aimes pas</h1><section class="panel"><span class="eyebrow">4/5 · J’ÉVITE</span>${onboardChips('disliked')}<div class="field"><label>Ajoute autant d’aliments que tu veux</label><input data-obtext="disliked" value="${state.profile.disliked.join(', ')}" placeholder="Ex. fenouil, champignons, olives"></div></section>`;if(n===4)b=`<h1>🍳 Ton équipement</h1><section class="panel"><span class="eyebrow">5/5 · CUISINE</span><div class="chips">${['four','Airfryer','wok','micro-ondes','blender'].map(x=>`<button class="chip ${state.profile.equipment.includes(x)?'on':''}" data-obequip="${x}">${state.profile.equipment.includes(x)?'✓ ':''}${x}</button>`).join('')}</div></section><button class="btn wide" data-obfinish>Commencer Swipe Repas →</button>`;return `${b}<div class="slide-nav">${n>0?'<button class="btn secondary" data-obback>← Retour</button>':''}${n<4?'<button class="btn" data-obnext>Continuer →</button>':''}</div>`}
'''
s=s[:pos]+onboard+s[pos:]
# Gate render on first use only.
needle="function render(){const body="
if needle not in s: raise SystemExit('Render introuvable.')
s=s.replace(needle,"function render(){if(!state.onboardDone){app.innerHTML=onboarding();return}const body=",1)
# Insert click handlers after button guard.
click="app.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;"
if click not in s: raise SystemExit('Gestionnaire click introuvable.')
actions="""if(b.hasAttribute('data-obnext')){state.onboardStep=Math.min(4,state.onboardStep+1);save();render();return}if(b.hasAttribute('data-obback')){state.onboardStep=Math.max(0,state.onboardStep-1);save();render();return}if(b.dataset.obchip){const [k,v]=b.dataset.obchip.split('|'),a=state.profile[k],i=a.indexOf(v);i<0?a.push(v):a.splice(i,1);save();render();return}if(b.dataset.obequip){const a=state.profile.equipment,v=b.dataset.obequip,i=a.indexOf(v);i<0?a.push(v):a.splice(i,1);save();render();return}if(b.hasAttribute('data-obfinish')){state.onboardDone=true;state.week.midPeople=state.week.evePeople=state.now.people=state.profile.people;save();state.view='home';render();return}"""
s=s.replace(click,click+actions,1)
# Input handlers for multiple-memory fields and household.
inputs="app.addEventListener('input',e=>{"
if inputs not in s: raise SystemExit('Gestionnaire input introuvable.')
s=s.replace(inputs,inputs+"if(e.target.dataset.obpeople!==undefined){state.profile.people=Math.max(1,Number(e.target.value)||1);save();return}if(e.target.dataset.obtext){state.profile[e.target.dataset.obtext]=e.target.value.split(',').map(x=>x.trim()).filter(Boolean);save();return}",1)
# Version display/index cache.
s=s.replace('Beta 5.19.0 · version candidate GitHub','Beta 5.19.2 · onboarding mémoire')
s=s.replace('Beta 5.19.1','Beta 5.19.2')
app.write_text(s,encoding='utf-8')
c=css.read_text(encoding='utf-8')+'\n/* 5.19.2 onboarding first launch */\n';css.write_text(c,encoding='utf-8')
x=idx.read_text(encoding='utf-8').replace('5.19.0','5.19.2').replace('5.19.1','5.19.2').replace('5190','5192').replace('5191','5192');idx.write_text(x,encoding='utf-8')
print('Patch 5.19.2 onboarding applique. Sauvegardes .bak5191 creees.')
