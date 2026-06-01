import os, codecs, re, sys

sys.stdout.reconfigure(encoding='utf-8')

results = []
for root, dirs, files in os.walk(r'E:\AI_Project\Hotel_PMS\dashboard'):
    for f in files:
        if f.endswith('.html'):
            path = os.path.join(root, f)
            with codecs.open(path, 'r', 'utf-8', errors='ignore') as file:
                c = file.read()
            title_m = re.search(r'<title>(.*?)</title>', c)
            h1_m = re.search(r'<h1[^>]*>(.*?)</h1>', c)
            title = title_m.group(1) if title_m else 'NONE'
            h1 = h1_m.group(1) if h1_m else 'NONE'
            results.append((f, title, h1))

for f, t, h in results:
    print(f'{f} | title: {t} | h1: {h}')
