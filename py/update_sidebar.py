import os
import glob
import re

base_dir = r"e:\AI_Project\Hotel_PMS\dashboard"
html_files = glob.glob(os.path.join(base_dir, "**", "*.html"), recursive=True)

for html_file in html_files:
    if "rates.html" in html_file:
        continue
        
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find the rooms link using * to match empty strings
    match = re.search(r'<a class="nav-item.*?" href="([^"]*)rooms\.html"><i class="fa-solid fa-bed"></i> 객실 관리</a>', content)
    
    if match:
        prefix_path = match.group(1)
        
        if '요금 캘린더' not in content:
            old_str = f'<a class="nav-item" href="{prefix_path}rooms.html"><i class="fa-solid fa-bed"></i> 객실 관리</a>'
            old_str_active = f'<a class="nav-item active" href="{prefix_path}rooms.html"><i class="fa-solid fa-bed"></i> 객실 관리</a>'
            
            new_link = f'\n            <a class="nav-item" href="{prefix_path}rates.html"><i class="fa-solid fa-tags"></i> 요금 캘린더</a>'
            
            if old_str in content:
                content = content.replace(old_str, old_str + new_link)
            elif old_str_active in content:
                content = content.replace(old_str_active, old_str_active + new_link)
                
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Added rates.html to {os.path.basename(html_file)}")
