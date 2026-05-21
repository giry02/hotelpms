import os, sys
sys.stdout.reconfigure(encoding='utf-8')

checks = [
    (r'E:\AI_Project\Hotel_PMS\dashboard\dashboard.html', 'data-i18n-key'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\crm\guests.html', 'data-i18n-key'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'role-card'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'permMatrix'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'rolePermPreview'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\common\js\i18n.js', 'PAGE_TITLE_MAP'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\common\js\sidebar.js', 'buildSidebar'),
]

all_ok = True
for path, needle in checks:
    c = open(path, encoding='utf-8', errors='ignore').read()
    ok = needle in c
    if not ok: all_ok = False
    print(f'{"OK" if ok else "FAIL"} | {os.path.basename(path)} | {needle}')

print()
print('ALL CHECKS PASSED' if all_ok else 'SOME CHECKS FAILED!')
