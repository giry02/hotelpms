import sys
sys.stdout.reconfigure(encoding='utf-8')

checks = [
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html', 'openCreateModal'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html', 'openEditModal'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html', 'confirmDelete'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html', 'perm-check-item'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\roles.html', 'SYSTEM_ROLES'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'loadCustomRoles'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'role-pick-card'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\settings\staff.html', 'permPreview'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\common\js\sidebar.js', 'roles.html'),
    (r'E:\AI_Project\Hotel_PMS\dashboard\common\js\sidebar.js', 'Role & Perms'),
]
import os
all_ok = True
for path, needle in checks:
    c = open(path, encoding='utf-8', errors='ignore').read()
    ok = needle in c
    if not ok: all_ok = False
    print(f'{"OK" if ok else "FAIL"} | {os.path.basename(path)} | {needle}')

print()
print('ALL CHECKS PASSED' if all_ok else 'SOME CHECKS FAILED!')
