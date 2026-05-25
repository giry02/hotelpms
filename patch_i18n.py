import os

file_path = os.path.join('dashboard', 'common', 'js', 'i18n.js')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"Groups": "그룹 관리",', '"Groups": "단체 관리",\n    "Group Companies": "단체업체 관리",\n    "Block Allocations": "행사 및 객실배정",')
content = content.replace('"Groups": "단체 관리",', '"Groups": "단체 관리",\n    "Group Companies": "단체업체 관리",\n    "Block Allocations": "행사 및 객실배정",') # Replace in second ko section too
content = content.replace('"Groups": "Groups",', '"Groups": "Groups",\n    "Group Companies": "Group Companies",\n    "Block Allocations": "Block Allocations",')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated i18n.js')
