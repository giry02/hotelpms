import os
file_path = os.path.join('dashboard', 'common', 'js', 'i18n.js')
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '"Guest CRM": "Guest CRM",',
    '"Guest CRM": "Guest CRM",\n            "Agencies": "Agencies",'
)
content = content.replace(
    '"Guest CRM": "고객 CRM",',
    '"Guest CRM": "고객 CRM",\n            "Agencies": "거래처/여행사",'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
