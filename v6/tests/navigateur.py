import asyncio,json,sys
from playwright.async_api import async_playwright
OUT='/tmp/t6/shots/';import os;os.makedirs(OUT,exist_ok=True)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
    ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True)
    pg=await ctx.new_page();errs=[]
    pg.on('console',lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.on('pageerror',lambda e: errs.append('PAGEERROR '+str(e)))
    await pg.goto('http://localhost:8765/v6/');await pg.wait_for_timeout(2500)
    await pg.screenshot(path=OUT+'01_presentation.png')
    # passer la présentation en répondant meal prep oui
    for i in range(20):
      st=await pg.evaluate('DSTEPS[state.dailyStep]')
      if st=='habits':
        await pg.click('[data-dpick="cookTime|30"]');await pg.click('[data-dpick="mealprep|oui"]')
      if st=='recap':
        await pg.click('[data-dfinish]');break
      await pg.click('[data-dnext]')
    await pg.wait_for_timeout(400);await pg.screenshot(path=OUT+'02_accueil.png')
    await pg.click('[data-go6="preparer"]');await pg.wait_for_timeout(500);await pg.screenshot(path=OUT+'03_prep_base.png')
    await pg.click('[data-p6="yes"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'04_prep_combien.png')
    await pg.click('[data-p6n="3"]');await pg.click('[data-p6="yes"]');await pg.click('[data-p6n="2"]');await pg.wait_for_timeout(400)
    await pg.screenshot(path=OUT+'05_swipe_plats.png')
    for i in range(300):
      if await pg.evaluate('state.view')!='swipe':break
      await pg.click('[data-swipe="yes"]')
    await pg.wait_for_timeout(400);await pg.screenshot(path=OUT+'06_planning.png')
    k=await pg.evaluate("Object.keys(state.planner).find(x=>x.endsWith('-1'))")
    await pg.click(f'[data-day6="{k[0]}"]');await pg.click(f'[data-row6="{k}"]');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'07_planning_ligne.png')
    rid=await pg.evaluate(f"state.planner['{k}']")
    await pg.click(f'.meal6-more [data-recipe="{rid}"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'08_fiche.png')
    await pg.click('.ing6');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'09_substitution.png')
    await pg.click('[data-sub6back]');await pg.click('.bar6 [data-cons6]');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'10_conservation.png')
    await pg.click('[data-cons6close]');await pg.click('.sheet6 > [data-cook]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'11_mode_cuisine.png')
    await pg.evaluate('state.cook=null;state.modal=null;render()')
    await pg.click('.nav6 [data-go="shopping"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'12_courses.png')
    await pg.click('.nav6 [data-go="profile"]');await pg.wait_for_timeout(300);await pg.click('details[data-sec="orga"] summary');await pg.wait_for_timeout(200);await pg.screenshot(path=OUT+'13_profil.png')
    await pg.click('.nav6 [data-go="now"]');await pg.wait_for_timeout(300);await pg.screenshot(path=OUT+'14_cuisiner.png')
    # rechargement
    await pg.reload();await pg.wait_for_timeout(2500)
    n=await pg.evaluate('Object.keys(state.planner).length');v=await pg.evaluate('state.view')
    sw=await pg.evaluate("navigator.serviceWorker.getRegistration().then(r=>r&&r.active&&r.active.scriptURL)")
    ck=await pg.evaluate("caches.keys()")
    print(json.dumps({'apres_rechargement_planning':n,'vue':v,'sw':sw,'caches':ck,'erreurs_console':errs},ensure_ascii=False))
    await b.close()
asyncio.run(main())
