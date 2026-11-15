from pathlib import Path
root=Path(__file__).resolve().parent
idx=root/'index.html'
if not idx.exists(): raise SystemExit('Place ce patch dans la racine Swipe Repas, à côté de index.html.')
s=idx.read_text(encoding='utf-8')
if 'patch5140.css' not in s:s=s.replace('</head>','<link rel="stylesheet" href="./css/patch5140.css?v=5140"></head>')
if 'patch5140.js' not in s:s=s.replace('</body>','<script src="./js/patch5140.js?v=5140"></script></body>')
s=s.replace('Beta 5.13.4','Beta 5.14.0')
idx.write_text(s,encoding='utf-8')
print('Patch 5.14.0 applique avec succes.')
