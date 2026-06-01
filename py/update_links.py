import os
import glob

html_files = ['dashboard/dashboard.html', 'dashboard/reservation-timeline.html', 'dashboard/reservation-list.html', 'dashboard/checkin.html']

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
        
    old_text = '<a class="nav-item"><i class="fa-solid fa-gear"></i> 호텔 설정</a>\n            <a class="nav-item"><i class="fa-solid fa-user-shield"></i> 직원 관리</a>'
    new_text = '<a class="nav-item" href="settings.html"><i class="fa-solid fa-gear"></i> 호텔 설정</a>\n            <a class="nav-item" href="staff.html"><i class="fa-solid fa-user-shield"></i> 직원 관리</a>'
            
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
