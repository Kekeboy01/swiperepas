# Fiche Santé dans un vrai Chrome (mobile 390 px) : écran, recherche, gestes, 0 erreur console.
import asyncio,os
from playwright.async_api import async_playwright
OUT='/tmp/t11/';os.makedirs(OUT,exist_ok=True);R=[]
def ok(c,m):R.append(c);print(('✅ ' if c else '❌ ')+m)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    pg=await ctx.new_page();errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    pg.on('dialog',lambda d: asyncio.ensure_future(d.accept()))
    await pg.goto('http://localhost:8765/');await pg.wait_for_timeout(2500)
    await pg.evaluate('localStorage.setItem(K+"onboarded","true");state.view="home";render()');await pg.wait_for_timeout(500)
    await pg.screenshot(path=OUT+'01_accueil_daily.png')
    src=await pg.evaluate("[...document.querySelectorAll('img')].map(i=>i.src+'|'+i.naturalWidth)")
    ok(any('poses/daily-saluer.png' in s and not s.endswith('|0') for s in src),'nouvelle Daily chargée à l’accueil')
    await pg.click('[data-go="profile"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'02_profil.png',full_page=True)
    await pg.click('[data-go="health"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'03_sante_vide.png',full_page=True)
    await pg.fill('[data-hcondq]','cro');await pg.wait_for_timeout(200)
    ok(await pg.locator('[data-hcond="crohn"]').count()==1,'recherche « cro » → Maladie de Crohn proposé')
    await pg.screenshot(path=OUT+'04_recherche.png')
    await pg.click('[data-hcond="crohn"]');await pg.wait_for_timeout(200)
    await pg.screenshot(path=OUT+'04b_recommandations.png',full_page=True)
    ok(await pg.locator('.hsrc a[href^="https://www.ameli.fr"]').count()>=1,'recommandations Crohn avec lien ameli.fr')
    await pg.click('[data-hcondopen="crohn"]')
    await pg.fill('[data-hfoodq]','tomat');await pg.wait_for_timeout(200)
    ok(await pg.locator('[data-hfood]').count()==3,'recherche « tomat » → 3 aliments de la base (tomates, concassées, concentré)')
    await pg.click('[data-hfood="tomates"]');await pg.wait_for_timeout(200);await pg.click('[data-hset="tomates|status|LIMIT"]');await pg.wait_for_timeout(200)
    await pg.screenshot(path=OUT+'05_detail_frequence.png',full_page=True)
    await pg.click('[data-hset="tomates|freq|max1"]');await pg.click('[data-hclose]')
    for f in ['oignon','ail','poivrons']:
      await pg.fill('[data-hfoodq]',f[:5]);await pg.wait_for_timeout(150);await pg.click(f'[data-hfood="{f}"]');await pg.wait_for_timeout(150);await pg.click('[data-hclose]')
    await pg.screenshot(path=OUT+'06_sante_liste.png',full_page=True)
    await pg.click('[data-go="healthSwipe"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'07_swipe_aliment.png')
    async def drag(dx,dy):
      bx=await pg.locator('.hcard').bounding_box();x=bx['x']+bx['width']/2;y=bx['y']+bx['height']/2
      await pg.mouse.move(x,y);await pg.mouse.down()
      for i in range(1,11):await pg.mouse.move(x+dx*i/10,y+dy*i/10)
      await pg.mouse.up();await pg.wait_for_timeout(250)
    await drag(160,0);await drag(-160,0);await drag(0,-180)
    st=await pg.evaluate("state.profile.health.foodRules.map(r=>r.foodOrFamilyId+':'+r.status).join(',')")
    ok(st=='tomates:LIMIT,oignon:TOLERATED,ail:AVOID,poivrons:STRICT_EXCLUSION','gestes réels : droite=tolère, gauche=éviter, haut=exclure ('+st+')')
    await pg.screenshot(path=OUT+'08_fin_tri.png')
    await pg.click('[data-go="health"]');await pg.wait_for_timeout(200);await pg.click('[data-hedit="ail"]');await pg.wait_for_timeout(200)
    ok(await pg.locator('[data-hsheet]').count()==1,'toucher un aliment ouvre son détail');await pg.click('[data-hclose]')
    # swipe de la semaine avec la fiche active
    await pg.evaluate('state.profile.prepMeal=false;state.profile.mealprep="non";state.profile._mp="non";save()')
    await pg.click('[data-go="home"]');await pg.click('[data-go6="preparer"]');await pg.wait_for_timeout(300)
    await pg.click('[data-startweek]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'09_swipe_repas.png')
    for i in range(300):
      if await pg.evaluate('state.view')!='swipe':break
      if await pg.locator('.hwarn').count():await pg.screenshot(path=OUT+'10_avertissement.png')
      await pg.click('[data-swipe="yes"]')
    bad=await pg.evaluate("state.saved.filter(s=>SRHealth.recipeFoods(state.recipes[s.id]).foods.includes('poivrons')).length")
    tom=await pg.evaluate("state.saved.filter(s=>SRHealth.recipeFoods(state.recipes[s.id]).foods.includes('tomates')).reduce((a,s)=>a+(s.rep||1),0)")
    ok(bad==0 and tom<=1,f'semaine : 0 plat avec poivrons (exclus), {tom} avec tomates (max 1)')
    await pg.screenshot(path=OUT+'11_planning.png')
    ok(not errs,'0 erreur console'+(' : '+' | '.join(errs) if errs else ''))
    await b.close()
  print(f'{sum(R)}/{len(R)} vérifications réussies')
asyncio.run(main())
