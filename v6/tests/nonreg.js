// Compare le moteur 5.60.0 (racine, app.js seul) et la 6.0.0 (v6, app.js + ui6.js), mode Normal, mêmes données.
const fs=require('fs'),vm=require('vm'),path=require('path');
function mk(dir,withUi){const store={'sr517_onboarded':'true','sr517_profile':JSON.stringify({people:4,allergies:['arachides'],loved:['poulet'],disliked:['olives'],equipment:['Four','Plaques','Friteuse'],family:['Moi'],goal:'plaisir',diet:'omni'})};
 const L=[];const el=(a)=>({addEventListener(t,f){},querySelector(){return null},querySelectorAll(){return[]},innerHTML:'',hidden:true,remove(){},appendChild(){},classList:{add(){},remove(){}},setAttribute(){}});const app=el(1);
 const ctx={setTimeout,clearTimeout,setInterval,clearInterval,URL,URLSearchParams,Promise,JSON,Math,Date,console:{log(){},warn(){},error(){}},localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)}},document:{querySelector:()=>null,getElementById:id=>id==='app'?app:null,createElement:()=>el(),body:{appendChild(){}},addEventListener(){}},navigator:{},location:{href:'x',hash:'',origin:'x',pathname:'/',search:''},history:{replaceState(){}},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),unescape,escape,app,confirm:()=>true,prompt:()=>null,alert(){},addEventListener(){},scrollTo(){},
  fetch:u=>Promise.resolve({json:()=>Promise.resolve(JSON.parse(fs.readFileSync(path.join(dir,u.split('?')[0]),'utf8')))})};
 ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(dir,'js/app.js'),'utf8'),ctx);if(withUi)vm.runInContext(fs.readFileSync(path.join(dir,'js/ui6.js'),'utf8'),ctx);return e=>vm.runInContext(e,ctx)}
const A=mk(path.join(__dirname,'../../'),false),B=mk(path.join(__dirname,'../'),true);
setTimeout(()=>{const tests={
 'nombre de recettes':'state.recipes.length',
 'recettes autorisées (profil test)':'state.recipes.filter(r=>allowed(r)).length',
 'ingrédients de 400 recettes (4 pers.)':'JSON.stringify(state.recipes.slice(0,400).map(r=>ings(r,4)))',
 'nutrition de 400 recettes':'JSON.stringify(state.recipes.slice(0,400).map(r=>nutri(r,4)))',
 'étapes de 200 recettes':'JSON.stringify(state.recipes.slice(0,200).map(r=>steps(r)))',
 'substitutions (poulet, riz, courgettes)':'JSON.stringify(state.recipes.slice(0,300).map(r=>[swapCands("filets de poulet",r),swapCands("riz",r),swapCands("courgettes",r)]))',
 'familles prep meal':'JSON.stringify(prepFamilles())',
 'bases rapides':'JSON.stringify([...quickGroups().values()])',
 'conservation (jours) 400 recettes':'JSON.stringify(state.recipes.slice(0,400).map(r=>{try{return consJours(r,true)}catch(e){return "x"}}))',
 'liste de courses (planning fixe)':'(()=>{state.planner={"0-0":10,"0-1":20,"1-1":30,"2-1":40,"3-2":state.recipes.findIndex(r=>searchType(r)==="dessert")};state.view="shopping";return JSON.stringify(shopping().match(/(data-check|value)="[^"]*"/g))})()',
 'planning auto (graine fixe)':'(()=>{Math.random=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();state.week.eveMeals=5;state.week.midMeals=3;autoPlan&&autoPlan();return JSON.stringify(state.planner)})()',
};
let ok=0;for(const[n,e]of Object.entries(tests)){let a,b;try{a=A(e)}catch(x){a='ERR '+x.message}try{b=B(e)}catch(x){b='ERR '+x.message}const same=a===b;if(same)ok++;console.log((same?'✅ identique':'❌ DIFFÉRENT')+' — '+n+(same?'':` (5.60: ${String(a).slice(0,120)} | 6.0: ${String(b).slice(0,120)})`))}
console.log(`${ok}/${Object.keys(tests).length} identiques`)},2500);
