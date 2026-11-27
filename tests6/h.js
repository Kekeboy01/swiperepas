const DATE=process.argv[3]||'';
const fs=require('fs'),vm=require('vm'),path=require('path');
const base=process.argv[2]||'./';const store=process.env.STORE&&fs.existsSync(process.env.STORE)?JSON.parse(fs.readFileSync(process.env.STORE,'utf8')):{};process.on('exit',()=>{if(process.env.STORE)fs.writeFileSync(process.env.STORE,JSON.stringify(store))});const L=[];const OT={};const ERR=[];
const el=(isApp)=>({addEventListener(t,f,cap){if(isApp&&t==='click')L.push({f,cap:!!cap});else if(isApp)(OT[t]=OT[t]||[]).push(f)},querySelector(){return null},querySelectorAll(){return[]},set innerHTML(v){this._h=v},get innerHTML(){return this._h||''},hidden:true,remove(){},appendChild(){},classList:{add(){},remove(){}},setAttribute(){}});
const app=el(true);const BODY={};
const ctx={setTimeout,clearTimeout,setInterval,clearInterval,URL,URLSearchParams,Promise,JSON,Math,Date,WeakMap,
 console:{log:console.log,warn(){},error:(...a)=>ERR.push(a.join(' '))},
 localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
 document:{querySelector:()=>null,getElementById:(id)=>id==='app'?app:(BODY[id]||null),createElement:()=>{const e=el();e.remove=function(){delete BODY[this.id]};return e},body:{appendChild(x){BODY[x.id]=x}},addEventListener(){}},
 navigator:{},location:{href:'https://kekeboy01.github.io/swiperepas/v6/',hash:'',origin:'https://kekeboy01.github.io',pathname:'/swiperepas/v6/',search:DATE},history:{replaceState(){}},btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),unescape,escape,
 app, confirm:()=>true, prompt:()=>ctx.__prompt??null, alert(){},addEventListener(){},scrollTo(){},
 fetch:(u)=>Promise.resolve({json:()=>Promise.resolve(JSON.parse(fs.readFileSync(path.join(base,u.split('?')[0]),'utf8')))})};
ctx.globalThis=ctx;ctx.window=ctx;vm.createContext(ctx);
const run=(f)=>{try{vm.runInContext(fs.readFileSync(path.join(base,f),'utf8'),ctx,{filename:f})}catch(e){ERR.push(f+': '+e.stack)}};
run('js/app.js');run('js/ui6.js');if(fs.existsSync(path.join(base,'js/health-templates.js')))run('js/health-templates.js');if(fs.existsSync(path.join(base,'js/health.js')))run('js/health.js');
const R=e=>vm.runInContext(e,ctx),T=h=>h.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
async function click(attrs,tag='BUTTON'){const ds={};for(const k in attrs)if(k.startsWith('data-'))ds[k.slice(5).replace(/-([a-z])/g,(m,x)=>x.toUpperCase())]=attrs[k];let stopped=false;const b={dataset:ds,tagName:tag,hasAttribute:a=>a in attrs,getAttribute:a=>attrs[a]};const ev={target:{closest:()=>b},stopPropagation(){stopped=true},preventDefault(){}};
 for(const l of L.filter(x=>x.cap)){await l.f(ev);if(stopped)return}for(const l of L.filter(x=>!x.cap)){await l.f(ev);if(stopped)return}}
const H=()=>R('app.innerHTML'),ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)process.exitCode=1};
async function fire(t,ds,extra={}){for(const f of OT[t]||[])await f({target:{dataset:ds,...extra,closest:()=>null}})}
module.exports={fire,R,T,click,H,ok,ERR,store,ctx};
