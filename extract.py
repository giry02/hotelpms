import os
import json

dashboard_dir = 'E:/AI_Project/Hotel_PMS/dashboard'
db = {}

def extract_arrays_from_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    idx = 0
    while True:
        # find 'const ' or 'let '
        import re
        match = re.search(r'(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*\[', content[idx:])
        if not match:
            break
        
        start_idx = idx + match.end() - 1 # points to '['
        var_name = match.group(2)
        
        # balance brackets
        depth = 0
        end_idx = start_idx
        for i, char in enumerate(content[start_idx:]):
            if char == '[':
                depth += 1
            elif char == ']':
                depth -= 1
                if depth == 0:
                    end_idx = start_idx + i
                    break
        
        if depth == 0:
            var_val = content[start_idx:end_idx+1]
            if '{' in var_val and var_name not in ['items', 'textNodes', 'chips', 'filtered']:
                db[var_name] = var_val
        
        idx = start_idx + 1

for root, _, files in os.walk(dashboard_dir):
    for file in files:
        if file.endswith('.html'):
            extract_arrays_from_file(os.path.join(root, file))

with open('E:/AI_Project/Hotel_PMS/dashboard/common/js/api-store.js', 'w', encoding='utf-8') as f:
    f.write('// api-store.js\n\n')
    for k, v in db.items():
        f.write(f'const _{k} = {v};\n\n')
    
    f.write('window.PmsAPI = {\n')
    for k in db.keys():
        f.write(f'    get{k[0].upper() + k[1:]}: async () => {{ return JSON.parse(JSON.stringify(_{k})); }},\n')
    
    # Add guests and reservations that might be loaded via fetch
    f.write('    getGuests: async () => { const res = await fetch(\'../../common/data/guests.json\').catch(() => fetch(\'../common/data/guests.json\')); return res.json(); },\n')
    f.write('    getReservations: async () => { const res = await fetch(\'../../common/data/reservations.json\').catch(() => fetch(\'../common/data/reservations.json\')); return res.json(); },\n')
    f.write('};\n')

print(f"Extracted keys: {list(db.keys())}")
