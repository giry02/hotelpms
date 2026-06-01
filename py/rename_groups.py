import os
import re

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Header and titles
content = content.replace('<h1 data-i18n-key="Groups">단체 관리</h1>', '<h1 data-i18n-key="Groups">단체 행사/블록 관리</h1>')
content = content.replace('<div class="kpi-label">전체 단체</div>', '<div class="kpi-label">전체 행사</div>')

# Buttons and texts
content = content.replace('신규 단체 등록', '신규 행사(블록) 등록')
content = content.replace('단체 정보 수정', '행사 정보 수정')
content = content.replace('단체명', '행사(블록)명')
content = content.replace('단체 유형', '행사 유형')
content = content.replace('단체 상세', '행사 상세')
content = content.replace('신규 단체가 등록되었습니다.', '신규 행사 블록이 등록되었습니다.')
content = content.replace('단체 정보가 수정되었습니다.', '행사 정보가 수정되었습니다.')
content = content.replace('단체가 삭제되었습니다.', '행사가 취소/삭제되었습니다.')

# Javascript delete confirm message
content = re.sub(r'정말 \[\$\{g\.name\}\] 단체를 삭제하시겠습니까\?', r'정말 [${g.name}] 행사를 취소(삭제)하시겠습니까?', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Renamed groups.html terminologies')
