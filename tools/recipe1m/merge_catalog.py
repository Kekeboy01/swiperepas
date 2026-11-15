#!/usr/bin/env python3
import argparse,json,re
p=argparse.ArgumentParser();p.add_argument('--base',required=True);p.add_argument('--imported',required=True);p.add_argument('--out',required=True);a=p.parse_args()
base=json.load(open(a.base,encoding='utf-8')); imp=json.load(open(a.imported,encoding='utf-8')); seen={re.sub(r'\W+','',r[1].lower()) for r in base}; added=0
for r in imp:
 k=re.sub(r'\W+','',r[1].lower())
 if k not in seen:base.append(r);seen.add(k);added+=1
json.dump(base,open(a.out,'w',encoding='utf-8'),ensure_ascii=False,indent=2);print({'total':len(base),'added':added})
