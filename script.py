import os
import re

html_files = []
for root, _, files in os.walk('E:/AI_Project/Hotel_PMS/dashboard'):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

print(f'Found {len(html_files)} HTML files.')
