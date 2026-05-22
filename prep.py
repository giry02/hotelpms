import os
import re

dashboard_dir = 'E:/AI_Project/Hotel_PMS/dashboard'
files_to_arrays = {}
db = {}

def extract_and_prepare(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    idx = 0
    arrays_in_file = []
    
    while True:
        match = re.search(r'(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*\[', content[idx:])
        if not match:
            break
        
        start_idx = idx + match.end() - 1
        var_name = match.group(2)
        
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
            if '{' in var_val and var_name not in ['items', 'textNodes', 'chips', 'filtered', 'roomTypes', 'stConfig']:
                arrays_in_file.append((var_name, content[idx + match.start():end_idx+1] + ';'))
        
        idx = start_idx + 1
    
    if arrays_in_file:
        files_to_arrays[filepath] = arrays_in_file

for root, _, files in os.walk(dashboard_dir):
    for file in files:
        if file.endswith('.html'):
            extract_and_prepare(os.path.join(root, file))

for path, arrs in files_to_arrays.items():
    print(f"{os.path.basename(path)}: {[a[0] for a in arrs]}")
