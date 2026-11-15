#!/usr/bin/env python3
"""Convertit le JSONL revu/enrichi vers data/recettes-importees.json.
Les lignes sans traduction francaise ou sans quantites restent en quarantaine.
"""
import argparse,json,re
from pathlib import Path

def parse_qty(items):
    out=[]
    for x in items:
        if not all(k in x for k in ('name_fr','qty','unit')): return None
        out.append(f"{x['name_fr']};{float(x['qty'])};{x['unit']};E")
    return '|'.join(out)
def main():
    p=argparse.ArgumentParser(); p.add_argument('--input',required=True); p.add_argument('--out',required=True); p.add_argument('--quarantine',required=True); a=p.parse_args()
    ready=[]; quarantine=[]; names=set()
    for line in open(a.input,encoding='utf-8'):
        r=json.loads(line); title=(r.get('title_fr') or '').strip(); ing=parse_qty(r.get('ingredients',[])); steps=r.get('instructions_fr') or []
        if not title or not ing or not steps: quarantine.append(r); continue
        sig=re.sub(r'\W+','',title.lower())
        if sig in names: continue
        names.add(sig); cat=r.get('category','repas'); tags=','.join(dict.fromkeys([cat]+r.get('tags',[])))
        ready.append([r.get('emoji','🍽️'),title,int(r.get('time_minutes',30)),tags,ing,'. '.join(steps)+'.',r.get('image',''),float(r.get('kcal',0)),float(r.get('protein',0)),float(r.get('carbs',0)),float(r.get('fat',0))])
    Path(a.out).parent.mkdir(parents=True,exist_ok=True); json.dump(ready,open(a.out,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
    with open(a.quarantine,'w',encoding='utf-8') as f:
        for r in quarantine:f.write(json.dumps(r,ensure_ascii=False)+'\n')
    print(json.dumps({'ready':len(ready),'quarantine':len(quarantine)},ensure_ascii=False))
if __name__=='__main__':main()
