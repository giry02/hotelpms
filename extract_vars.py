import os
import re

dashboard_dir = 'E:/AI_Project/Hotel_PMS/dashboard'
files_with_arrays = []

# regex to find const name = [ ... ];
pattern = re.compile(r'(const|let)\s+([a-zA-Z0-9_]+)\s*=\s*\[(.*?)\];', re.DOTALL)

for root, _, files in os.walk(dashboard_dir):
    for file in files:
        if file.endswith('.html'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            matches = pattern.findall(content)
            if matches:
                # filter out small arrays that are not data
                data_matches = [m for m in matches if '{' in m[2]]
                if data_matches:
                    files_with_arrays.append((path, data_matches))

for path, matches in files_with_arrays:
    print(f"{os.path.relpath(path, dashboard_dir)}: {[m[1] for m in matches]}")
