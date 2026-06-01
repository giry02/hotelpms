import re, glob
sys_path = r'E:\AI_Project\Hotel_PMS\admin\system'

# users.html
path = f'{sys_path}/users.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f: content = f.read()
content = re.sub(r'<title>.*?</title>', '<title>사용자 관리 - Super Admin</title>', content)
content = re.sub(r'<h1>.*?</h1>', '<h1>사용자 관리</h1>', content)
content = re.sub(r'<button class="btn-primary"([^>]*)>.*?<i class="fa-solid fa-user-plus"></i>.*?</button>', r'<button class="btn-primary"\1><i class="fa-solid fa-user-plus"></i> 신규 사용자 추가</button>', content)
content = re.sub(r'<h2>u.*?</h2>', '<h2>시스템 사용자 목록</h2>', content)
with open(path, 'w', encoding='utf-8') as f: f.write(content)

# audit-logs.html
path = f'{sys_path}/audit-logs.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f: content = f.read()
content = re.sub(r'<title>.*?</title>', '<title>감사 로그 (Audit Logs) - Super Admin</title>', content)
content = re.sub(r'<h1>.*?</h1>', '<h1>감사 로그 (Audit Logs)</h1>', content)
content = re.sub(r'<a class="btn-outline".*?CSV\s*\?\s*?.*?</a>', r'<a class="btn-outline" download href="../common/downloads/global_audit_logs.csv" style="padding:6px 12px;font-size:0.8rem;text-decoration:none;"><i class="fa-solid fa-download"></i> CSV 다운로드</a>', content)
content = re.sub(r'<a class="btn-outline" download="" href="\.\./common/downloads/global_audit_logs\.csv"([^>]*)>.*?<i class="fa-solid fa-download"></i>.*?</a>', r'<a class="btn-outline" download="" href="../common/downloads/global_audit_logs.csv"\1><i class="fa-solid fa-download"></i> CSV 다운로드</a>', content)
content = re.sub(r'<h2>u.*?</h2>', '<h2>전체 감사 로그</h2>', content)
with open(path, 'w', encoding='utf-8') as f: f.write(content)

# helpdesk.html
path = f'{sys_path}/helpdesk.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f: content = f.read()
content = re.sub(r'<title>.*?</title>', '<title>고객 지원 (Helpdesk) - Super Admin</title>', content)
content = re.sub(r'<h1>.*?</h1>', '<h1>고객 지원 (Helpdesk)</h1>', content)
content = re.sub(r'<button class="btn-primary"><i class="fa-solid fa-paper-plane"></i>.*?</button>', r'<button class="btn-primary"><i class="fa-solid fa-paper-plane"></i> 메시지 전송</button>', content)
# Check for any other mojibake in helpdesk
content = re.sub(r'<div class="message-bubble received">(.*?)</div>', r'<div class="message-bubble received">도착했습니다. 확인 부탁드립니다.</div>', content)
content = re.sub(r'<div class="message-bubble sent">(.*?)</div>', r'<div class="message-bubble sent">안녕하세요, 답변드립니다.</div>', content)
content = re.sub(r'placeholder=".*?"', r'placeholder="메시지를 입력하세요..."', content)
with open(path, 'w', encoding='utf-8') as f: f.write(content)

# profile.html
path = f'{sys_path}/profile.html'
with open(path, 'r', encoding='utf-8', errors='ignore') as f: content = f.read()
content = re.sub(r'<title>.*?</title>', '<title>프로필 설정 - Super Admin</title>', content)
content = re.sub(r'<h1>.*?</h1>', '<h1>프로필 설정</h1>', content)
content = re.sub(r'<button class="btn-outline"([^>]*)>.*?</button>', r'<button class="btn-outline"\1>비밀번호 변경</button>', content)
content = re.sub(r'<h2><i class="fa-solid fa-laptop-medical"></i>.*?</h2>', r'<h2><i class="fa-solid fa-laptop-medical"></i> 등록된 기기 관리 (Trusted Devices)</h2>', content)
content = re.sub(r'<button class="btn-danger btn-sm"([^>]*)><i class="fa-solid fa-ban"></i>.*?</button>', r'<button class="btn-danger btn-sm"\1><i class="fa-solid fa-ban"></i> 연결 해제</button>', content)
with open(path, 'w', encoding='utf-8') as f: f.write(content)

print("Task 2 Done")
