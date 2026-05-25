import os

file_path = os.path.join('dashboard', 'frontdesk', 'groups.html')

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

new_field = """            <div>
                <label class="form-label">행사(블록)명 <span style="color:var(--danger)">*</span></label>
                <input type="text" id="ngName" class="form-input" style="width:100%" placeholder="예: Samsung Tech Conference 2026">
            </div>
            <div>
                <label class="form-label">주관 거래처 (Agency / Corporate) <span style="color:var(--danger)">*</span></label>
                <select id="ngAgency" class="form-input" style="width:100%">
                    <option>삼성전자 (Samsung Electronics)</option>
                    <option>모두투어 (Modetour)</option>
                    <option>하나투어 (Hana Tour)</option>
                    <option>한화이글스 (Hanwha Eagles)</option>
                    <option>개인(Private Event)</option>
                </select>
            </div>"""

content = content.replace(
    '            <div>\n                <label class="form-label">행사(블록)명 <span style="color:var(--danger)">*</span></label>\n                <input type="text" id="ngName" class="form-input" style="width:100%" placeholder="예: Samsung Tech Conference 2026">\n            </div>',
    new_field
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Added Agency field to modal')
