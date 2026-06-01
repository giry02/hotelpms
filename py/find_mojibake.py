import glob, re, sys

sys.stdout.reconfigure(encoding='utf-8')

files = glob.glob(r'E:\AI_Project\Hotel_PMS\admin\system\*.html') + glob.glob(r'E:\AI_Project\Hotel_PMS\admin\ads\*.html')
for f in files:
    with open(f, 'r', encoding='utf-8', errors='replace') as file:
        content = file.read()
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        if '\ufffd' in line or ('?' in line and '<' in line and '>' in line):
            print(f"{f}:{i+1}: {line.strip()}")
