import json,re,sys
p=sys.argv[1] if len(sys.argv)>1 else 'data/recettes.json'
rows=json.load(open(p,encoding='utf-8'))
flags=[]
protein=re.compile(r'poulet|dinde|bœuf|boeuf|porc|saumon|thon|poisson|crevette|viande|steak',re.I)
starch=re.compile(r'riz|pâtes|pates|nouilles|semoule|quinoa|boulgour|avoine',re.I)
for r in rows:
 for part in str(r[4]).split('|'):
  a=part.split(';')
  if len(a)<3: continue
  try:q=float(a[1])
  except:continue
  n,u=a[0],a[2]
  if u=='g' and protein.search(n) and not (250<=q<=1000):flags.append((r[1],n,q,u,'protéine pour 4'))
  if u=='g' and starch.search(n) and not (120<=q<=600):flags.append((r[1],n,q,u,'féculent pour 4'))
  if u=='ml' and q>1500:flags.append((r[1],n,q,u,'liquide élevé'))
print('recettes',len(rows),'anomalies',len(flags))
for x in flags[:100]:print(' | '.join(map(str,x)))
