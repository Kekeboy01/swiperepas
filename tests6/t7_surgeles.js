const {R,T,click,H,ok,ERR}=require('./h.js');
setTimeout(async()=>{R('localStorage.setItem(K+"onboarded","true");state.week.time=30');
 const ids=R(`state.recipes.map((r,i)=>[r,i]).filter(([r])=>searchType(r)==='meal'&&/(courgettes|poivrons|carottes|brocoli|champignons de Paris);/.test(r[4])).slice(0,6).map(x=>x[1])`);
 R(`state.planner={};${JSON.stringify(ids)}.forEach((id,n)=>state.planner[n+'-1']=id);state.view='shopping';render()`);
 const rows=R(`JSON.stringify(shopRows().filter(x=>x.rayon==='❄️ Surgelés').map(x=>[x.name,x.qty,x.unit]))`);console.log(rows);
 ok(JSON.parse(rows).length>0&&JSON.parse(rows).every(x=>x[2]==='g'),'surgelés : tout en grammes');
 const h=H();const seg=h.split('Surgelés')[1].split('</section>')[0];console.log((seg.match(/value="[^"]*"/g)||[]).slice(0,12).join(' '));
 console.log('ERR',ERR)},1500);
