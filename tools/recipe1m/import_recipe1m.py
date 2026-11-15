#!/usr/bin/env python3
"""Recipe1M+ -> catalogue intermediaire Swipe Repas (JSONL).
Usage: python import_recipe1m.py --layer1 CHEMIN/layer1.json --layer2 CHEMIN/layer2.json --out import/recipe1m/normalized.jsonl --limit 10000
Le script ne telecharge pas le dataset. Il travaille sur les fichiers obtenus depuis la source officielle.
"""
import argparse, json, re, unicodedata
from pathlib import Path

def stream_array(path):
    try:
        import ijson
        with open(path,'rb') as f:
            yield from ijson.items(f,'item')
    except ImportError:
        with open(path,encoding='utf-8') as f:
            yield from json.load(f)

def clean(s): return re.sub(r'\s+',' ',str(s or '')).strip()
def key(s): return unicodedata.normalize('NFKD',clean(s)).encode('ascii','ignore').decode().lower()
def image_index(path):
    if not path: return {}
    out={}
    for row in stream_array(path):
        imgs=row.get('images') or []
        if imgs: out[row.get('id')]=imgs[0].get('url') or imgs[0].get('id')
    return out

def category(title, ingredients):
    t=key(title+' '+' '.join(ingredients))
    if any(x in t for x in ('smoothie','juice','drink','lemonade','shake','tea','coffee')):
        return 'boisson_detox' if any(x in t for x in ('detox','green juice','lemon ginger')) else 'boisson_energisante'
    if any(x in t for x in ('cake','cookie','brownie','tart','pie','dessert','pudding','mousse','ice cream','sorbet')): return 'dessert'
    return 'repas'

def main():
    a=argparse.ArgumentParser(); a.add_argument('--layer1',required=True); a.add_argument('--layer2'); a.add_argument('--out',required=True); a.add_argument('--limit',type=int,default=0); a.add_argument('--partition',choices=['train','val','test','all'],default='all'); args=a.parse_args()
    images=image_index(args.layer2) if args.layer2 else {}; seen=set(); kept=0; rejected=0
    Path(args.out).parent.mkdir(parents=True,exist_ok=True)
    with open(args.out,'w',encoding='utf-8') as out:
        for row in stream_array(args.layer1):
            if args.partition!='all' and row.get('partition')!=args.partition: continue
            title=clean(row.get('title')); ingredients=[clean(x.get('text')) for x in row.get('ingredients',[]) if clean(x.get('text'))]; instructions=[clean(x.get('text')) for x in row.get('instructions',[]) if clean(x.get('text'))]
            sig=key(title)+'|'+key('|'.join(ingredients[:8]))
            if not title or len(ingredients)<2 or len(instructions)<1 or sig in seen: rejected+=1; continue
            seen.add(sig)
            item={'source':'Recipe1M+','source_id':row.get('id'),'source_url':row.get('url'),'partition':row.get('partition'),'language':'unknown','title':title,'ingredients_raw':ingredients,'instructions_raw':instructions,'image':images.get(row.get('id'),''),'category':category(title,ingredients),'status':'needs_translation_and_quantities'}
            out.write(json.dumps(item,ensure_ascii=False)+'\n'); kept+=1
            if args.limit and kept>=args.limit: break
    print(json.dumps({'kept':kept,'rejected':rejected,'output':args.out},ensure_ascii=False))
if __name__=='__main__': main()
